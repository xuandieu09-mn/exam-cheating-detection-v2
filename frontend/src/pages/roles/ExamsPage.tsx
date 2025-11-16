import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi, type Exam } from '@/api/exams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/alert';

export const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examsApi.getAll('ACTIVE');
      setExams(data);
    } catch (err) {
      console.error('Error loading exams:', err);
      setError('Không thể tải danh sách kỳ thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExamAvailable = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return exam.status === 'ACTIVE' && now >= startTime && now <= endTime;
  };

  const getExamStatusBadge = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    
    if (exam.status === 'ENDED') {
      return <Badge variant="secondary">Đã kết thúc</Badge>;
    }
    
    if (now < startTime) {
      return <Badge variant="outline">Sắp diễn ra</Badge>;
    }
    
    if (isExamAvailable(exam)) {
      return <Badge className="bg-green-500">Đang mở</Badge>;
    }
    
    return <Badge variant="secondary">Không khả dụng</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách kỳ thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kỳ thi</h1>
        <p className="text-gray-600 mt-2">Chọn kỳ thi để bắt đầu làm bài</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Hiện tại không có kỳ thi nào đang mở</p>
            <p className="text-gray-400 text-sm mt-2">Vui lòng quay lại sau</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{exam.name}</CardTitle>
                  {getExamStatusBadge(exam)}
                </div>
                <CardDescription className="line-clamp-2">
                  {exam.description || 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Bắt đầu: {formatDate(exam.startTime)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Kết thúc: {formatDate(exam.endTime)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Thời gian: {exam.durationMinutes} phút</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!isExamAvailable(exam)}
                  onClick={() => navigate(`/mock-exam/${exam.id}`)}
                >
                  {isExamAvailable(exam) ? 'Bắt đầu thi' : 'Chưa khả dụng'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
