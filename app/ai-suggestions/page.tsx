"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  MessageSquare,
  Home,
  Car,
  CalendarCheck,
  TowerControl,
} from "lucide-react";

export default function RentalAIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "command-r-plus",
          prompt: `
          You are an AI assistant for a rental platform called RentEase. 
          Provide helpful, friendly answers to customer questions about:
          - Property rentals (homes, apartments)
          - Vehicle rentals (cars, bikes)
          - Equipment rentals (tools, party supplies)
          - Rental policies, pricing, and availability
          
          Customer Question: ${question}
          
          Answer concisely in 2-3 sentences maximum, focusing on being helpful and clear.
          `,
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      setAnswer(
        data.generations?.[0]?.text?.trim() ||
          "I couldn't find an answer to that question."
      );
    } catch (err) {
      console.error(err);
      setAnswer(
        "Sorry, I'm having trouble connecting. Please try again later."
      );
    }
    setLoading(false);
  };

  const handleExampleQuestion = (example: string) => {
    setQuestion(example);
  };

  const exampleQuestions = [
    "What's the minimum rental period for apartments?",
    "Do you offer monthly car rentals?",
    "How does the damage deposit work?",
    "What equipment is included with tool rentals?",
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Rental AI Assistant
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            Ask me anything about properties, vehicles, equipment, or rental
            policies
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your rental question here..."
              className="min-h-[120px]"
            />

            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleQuestion(q)}
                  className="text-xs h-8">
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              "Ask Rental Expert"
            )}
          </Button>

          {answer && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Answer</h3>
              </div>
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Home className="h-6 w-6 text-primary mb-1" />
              <span className="text-xs text-center">Properties</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Car className="h-6 w-6 text-primary mb-1" />
              <span className="text-xs text-center">Vehicles</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <TowerControl className="h-6 w-6 text-primary mb-1" />
              <span className="text-xs text-center">Equipment</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-primary mb-1" />
              <span className="text-xs text-center">Bookings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
