import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, MessageSquare, Phone, Video, MoreVertical, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ChatRoom {
  id: string;
  participant_1: string;
  participant_2: string;
  service_request_id?: string;
  created_at: string;
  updated_at: string;
  participant_1_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  participant_2_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  latest_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatSystemProps {
  serviceRequestId?: string;
  providerId?: string;
  customerId?: string;
}

export function ChatSystem({ serviceRequestId, providerId, customerId }: ChatSystemProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatRooms = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("chat_rooms")
      .select(`
        *,
        participant_1_profile:profiles!chat_rooms_participant_1_fkey(full_name, avatar_url),
        participant_2_profile:profiles!chat_rooms_participant_2_fkey(full_name, avatar_url)
      `)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (data) {
      // Fetch latest message and unread count for each room
      const roomsWithMetadata = await Promise.all(
        data.map(async (room) => {
          const { data: latestMessage } = await supabase
            .from("chat_messages")
            .select("content, created_at, sender_id")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("room_id", room.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          return {
            ...room,
            latest_message: latestMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      setChatRooms(roomsWithMetadata);
    }
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      
      // Mark messages as read
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .neq("sender_id", user!.id);
    }
  };

  const createOrFindChatRoom = async () => {
    if (!user || !providerId || !customerId) return;

    // Check if room already exists
    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("*")
      .or(
        `and(participant_1.eq.${providerId},participant_2.eq.${customerId}),and(participant_1.eq.${customerId},participant_2.eq.${providerId})`
      )
      .maybeSingle();

    if (existingRoom) {
      setSelectedRoom(existingRoom);
      fetchMessages(existingRoom.id);
      return existingRoom;
    }

    // Create new room
    const { data: newRoom, error } = await supabase
      .from("chat_rooms")
      .insert({
        participant_1: providerId,
        participant_2: customerId,
        service_request_id: serviceRequestId
      })
      .select(`
        *,
        participant_1_profile:profiles!chat_rooms_participant_1_fkey(full_name, avatar_url),
        participant_2_profile:profiles!chat_rooms_participant_2_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive"
      });
      return;
    }

    setSelectedRoom(newRoom);
    setChatRooms(prev => [newRoom, ...prev]);
    return newRoom;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: selectedRoom.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: "text"
        });

      if (error) throw error;

      // Update room's updated_at
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedRoom.id);

      setNewMessage("");
      fetchMessages(selectedRoom.id);
      fetchChatRooms();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (room: ChatRoom) => {
    if (room.participant_1 === user?.id) {
      return room.participant_2_profile;
    }
    return room.participant_1_profile;
  };

  useEffect(() => {
    if (user) {
      fetchChatRooms();

      // Set up real-time subscription for messages
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (selectedRoom && newMsg.room_id === selectedRoom.id) {
              setMessages(prev => [...prev, newMsg]);
            }
            fetchChatRooms(); // Refresh room list
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (providerId && customerId && !selectedRoom) {
      createOrFindChatRoom();
    }
  }, [providerId, customerId]);

  if (!user) return null;

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Chat Rooms List */}
      <div className="w-1/3 border-r bg-muted/50">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </h3>
        </div>
        <ScrollArea className="h-[calc(600px-73px)]">
          {chatRooms.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="p-2">
              {chatRooms.map((room) => {
                const otherParticipant = getOtherParticipant(room);
                return (
                  <Card
                    key={room.id}
                    className={`mb-2 cursor-pointer transition-colors hover:bg-muted/80 ${
                      selectedRoom?.id === room.id ? "bg-primary/10 border-primary/20" : ""
                    }`}
                    onClick={() => {
                      setSelectedRoom(room);
                      fetchMessages(room.id);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.avatar_url} />
                          <AvatarFallback>
                            {otherParticipant?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherParticipant?.full_name || "Unknown User"}
                            </p>
                            {room.unread_count! > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {room.unread_count}
                              </Badge>
                            )}
                          </div>
                          {room.latest_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {room.latest_message.content}
                            </p>
                          )}
                          {room.latest_message && (
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(room.latest_message.created_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={getOtherParticipant(selectedRoom)?.avatar_url} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedRoom)?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {getOtherParticipant(selectedRoom)?.full_name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMyMessage = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[70%] ${isMyMessage ? "flex-row-reverse" : ""}`}>
                        {!isMyMessage && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {message.sender?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            isMyMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}