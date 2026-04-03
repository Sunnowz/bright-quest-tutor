import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const SUBJECTS = [
  "Математика", "Физика", "Химия", "Биология", "История",
  "Русский язык", "Литература", "Английский язык", "Информатика",
  "География", "Обществознание",
];

const HOBBY_SUGGESTIONS = [
  "Minecraft", "Roblox", "Футбол", "Космос", "Роботы",
  "Аниме", "Музыка", "Рисование", "Кулинария", "Путешествия",
];

const Profile = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setName(data.display_name || "");
      setAge(data.age?.toString() || "");
      setGrade(data.grade?.toString() || "");
      setInterests(data.interests || []);
      setSubjects(data.subjects || []);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: name,
      age: age ? parseInt(age) : null,
      grade: grade ? parseInt(grade) : null,
      interests,
      subjects,
    });

    if (error) {
      toast({ variant: "destructive", title: "Ошибка", description: error.message });
    } else {
      toast({ title: "Профиль сохранён! ✅" });
    }
    setLoading(false);
  };

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Мой профиль</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Имя</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Возраст</label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="12" min={6} max={18} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Класс</label>
              <Input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="7" min={1} max={11} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Мои интересы и хобби 🎮</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {HOBBY_SUGGESTIONS.map((hobby) => (
              <Badge
                key={hobby}
                variant={interests.includes(hobby) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(hobby, interests, setInterests)}
              >
                {hobby}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Добавить своё..."
              onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
            />
            <Button variant="outline" onClick={addCustomInterest}>+</Button>
          </div>
          {interests.filter((i) => !HOBBY_SUGGESTIONS.includes(i)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.filter((i) => !HOBBY_SUGGESTIONS.includes(i)).map((i) => (
                <Badge key={i} variant="default" className="cursor-pointer" onClick={() => toggleItem(i, interests, setInterests)}>
                  {i} <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Мои предметы 📚</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <Badge
                key={subject}
                variant={subjects.includes(subject) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(subject, subjects, setSubjects)}
              >
                {subject}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveProfile} disabled={loading} className="w-full" size="lg">
        {loading ? "Сохранение..." : "Сохранить профиль"}
      </Button>
    </div>
  );
};

export default Profile;
