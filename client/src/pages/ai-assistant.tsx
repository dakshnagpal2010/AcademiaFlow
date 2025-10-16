import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Study Assistant powered by OpenAI's GPT-3.5 model. I'm here to help you with your academic questions, study tips, and more. How can I assist you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest<{ message: Message }>("/api/ai/chat", {
        method: "POST",
        body: {
          messages: [...messages, { role: "user", content: userMessage }]
        },
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    chatMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Study Assistant</h1>
              <p className="text-gray-400 text-sm">Powered by OpenAI GPT-3.5</p>
            </div>
          </div>
        </header>

        <Card className="bg-dark-secondary border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Chat with AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    data-testid={`message-${index}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-3 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary-500 text-white"
                          : "bg-dark-tertiary text-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-dark-tertiary rounded-lg px-4 py-3">
                      <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="flex-1 bg-dark-tertiary border-gray-600 text-white placeholder:text-gray-500"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                data-testid="button-send-message"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
