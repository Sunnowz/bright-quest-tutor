import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Sparkles, Send, Trophy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const SUBJECTS = [
  "Математика", "Физика", "Химия", "Биология", "История",
  "Русский язык", "Информатика",
];

const Tasks = () => {
  const [subject, setSubject] = useState("Математика");
  const [topic, setTopic] = useState("");
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const { toast } = useToast();

  const generateTask = async () => {
    setLoading(true);
    setTask("");
    setFeedback("");
    setAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-task", {
        body: { subject, topic },
      });

      if (error) throw error;
      setTask(data.task || "");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!answer.trim()) return;
    setCheckingAnswer(true);

    try {
      const { data, error } = await supabase.functions.invoke("check-answer", {
        body: { task, answer, subject },
      });

      if (error) throw error;
      setFeedback(data.feedback || "");

      if (data.correct) {
        setScore((s) => s + 10);
        setSolved((s) => s + 1);
        toast({ title: "Правильно! +10 очков 🎉" });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setCheckingAnswer(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Задачи-квесты
        </h1>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-base px-3 py-1">
            <Trophy className="h-4 w-4 mr-1 text-warning" /> {score} очков
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1 text-primary" /> {solved} решено
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Выбери предмет и тему</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Предмет" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Тема (необязательно)"
            />
          </div>
          <Button onClick={generateTask} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Генерирую задачу..." : "Сгенерировать задачу"}
          </Button>
        </CardContent>
      </Card>

      {task && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Задача 🧩</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert bg-accent/30 p-4 rounded-lg">
              <ReactMarkdown>{task}</ReactMarkdown>
            </div>
            <div className="flex gap-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Твой ответ..."
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              />
              <Button onClick={checkAnswer} disabled={checkingAnswer || !answer.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tasks;
