import { Brain, BookOpen, Gamepad2, Trophy, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Добро пожаловать в <span className="text-primary">ЭдуТьютор</span> 🎓
        </h1>
        <p className="text-muted-foreground text-lg">
          Твой персональный ИИ-помощник для учёбы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => navigate("/tutor")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-lg">ИИ-Тьютор</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground text-sm">
            Задай вопрос — тьютор поможет тебе найти ответ самостоятельно через наводящие вопросы
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-secondary/20" onClick={() => navigate("/notes")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
              <BookOpen className="h-7 w-7 text-secondary" />
            </div>
            <CardTitle className="text-lg">Умный конспект</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground text-sm">
            Загрузи аудио урока — получи структурированный конспект и проверочный тест
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => navigate("/tasks")}>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-2">
              <Gamepad2 className="h-7 w-7 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">Задачи-квесты</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground text-sm">
            Решай задачи, адаптированные под твои интересы — зарабатывай очки!
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-accent/30 border-0">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Задач решено</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/30 border-0">
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Очков заработано</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/30 border-0">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold text-foreground">0ч</p>
              <p className="text-xs text-muted-foreground">С тьютором</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" onClick={() => navigate("/tutor")} className="text-base">
          <Brain className="mr-2 h-5 w-5" />
          Начать обучение
        </Button>
      </div>
    </div>
  );
};

export default Index;
