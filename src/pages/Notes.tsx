import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

const Notes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setQuiz([]);
    setAnswers({});
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const { data, error } = await supabase.functions.invoke("process-notes", {
        body: formData,
      });

      if (error) throw error;

      setSummary(data.summary || "");
      setQuiz(data.quiz || []);
      toast({ title: "Конспект готов! 📝" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Ошибка", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIndex: number, aIndex: number) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: aIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correct = quiz.filter((q, i) => answers[i] === q.correct).length;
    toast({
      title: `Результат: ${correct}/${quiz.length}`,
      description: correct === quiz.length ? "Отлично! 🎉" : "Попробуй ещё раз!",
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-secondary" />
        Умный конспект
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Загрузить аудио/видео урока</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <Input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="max-w-xs mx-auto"
            />
            {file && (
              <p className="mt-2 text-sm text-muted-foreground">
                📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} МБ)
              </p>
            )}
          </div>
          <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
            {loading ? "Обрабатываю..." : "Создать конспект"}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Конспект
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {quiz.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Проверочный тест 📋</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="font-medium text-foreground">{qi + 1}. {q.question}</p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = q.correct === oi;
                    let variant: "outline" | "default" | "destructive" = "outline";
                    if (showResults && isCorrect) variant = "default";
                    else if (showResults && selected && !isCorrect) variant = "destructive";
                    else if (selected) variant = "default";

                    return (
                      <Badge
                        key={oi}
                        variant={variant}
                        className="cursor-pointer p-2 text-sm justify-start"
                        onClick={() => selectAnswer(qi, oi)}
                      >
                        {showResults && isCorrect && <CheckCircle className="h-4 w-4 mr-1" />}
                        {showResults && selected && !isCorrect && <XCircle className="h-4 w-4 mr-1" />}
                        {opt}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
            {!showResults && (
              <Button onClick={checkAnswers} disabled={Object.keys(answers).length < quiz.length}>
                Проверить ответы
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notes;
