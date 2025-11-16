import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { sessionsApi, type Session } from '@/api/sessions';
import { examsApi, type Exam } from '@/api/exams';
import { incidentsApi, type Incident } from '@/api/incidents';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Alert, AlertDescription } from '@/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import { AlertCircle, ClipboardList, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface SessionWithDetails extends Session {
  examName?: string;
  incidentsCount?: number;
}

export const MyResultsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [sessionIncidents, setSessionIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get user sessions
      const sessionsData = await sessionsApi.getByUser(user.id);
      
      // Load exam details and incidents count for each session
      const sessionsWithDetails = await Promise.all(
        sessionsData.map(async (session) => {
          try {
            const exam = await examsApi.getById(session.examId);
            const incidents = await incidentsApi.getAll({ sessionId: session.id }) as Incident[];
            
            return {
              ...session,
              examName: exam.name,
              incidentsCount: Array.isArray(incidents) ? incidents.length : 0
            };
          } catch (err) {
            console.error(`Error loading details for session ${session.id}:`, err);
            return {
              ...session,
              examName: 'Unknown Exam',
              incidentsCount: 0
            };
          }
        })
      );
      
      setSessions(sessionsWithDetails);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Không thể tải danh sách kết quả. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionIncidents = async (sessionId: string) => {
    try {
      setLoadingIncidents(true);
      const incidents = await incidentsApi.getAll({ sessionId }) as Incident[];
      setSessionIncidents(Array.isArray(incidents) ? incidents : []);
    } catch (err) {
      console.error('Error loading incidents:', err);
      setSessionIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleRowClick = async (session: SessionWithDetails) => {
    setSelectedSession(session);
    await loadSessionIncidents(session.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startedAt: string, endedAt: string | null) => {
    if (!endedAt) return 'Đang thi...';
    
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    
    return `${minutes} phút`;
  };

  const getStatusBadge = (status: Session['status']) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-500">Đang thi</Badge>;
    }
    return <Badge variant="secondary">Đã nộp bài</Badge>;
  };

  const getViolationsBadge = (count: number) => {
    if (count === 0) {
      return <Badge className="bg-green-100 text-green-800">Không vi phạm</Badge>;
    }
    if (count <= 2) {
      return <Badge className="bg-yellow-100 text-yellow-800">{count} vi phạm</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">{count} vi phạm</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kết quả của tôi</h1>
        <p className="text-gray-600 mt-2">Xem lại lịch sử thi và kết quả</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa tham gia kỳ thi nào</p>
            <p className="text-gray-400 text-sm mt-2">Hãy tham gia một kỳ thi để xem kết quả</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thi ({sessions.length} kỳ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kỳ thi</TableHead>
                  <TableHead>Thời gian bắt đầu</TableHead>
                  <TableHead>Thời gian làm bài</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Vi phạm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(session)}
                  >
                    <TableCell className="font-medium">
                      {session.examName || 'Loading...'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(session.startedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {getDuration(session.startedAt, session.endedAt)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>{getViolationsBadge(session.incidentsCount || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiên thi</DialogTitle>
            <DialogDescription>
              {selectedSession?.examName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Thời gian bắt đầu</p>
                <p className="font-medium">
                  {selectedSession && formatDate(selectedSession.startedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian kết thúc</p>
                <p className="font-medium">
                  {selectedSession?.endedAt ? formatDate(selectedSession.endedAt) : 'Đang thi...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian làm bài</p>
                <p className="font-medium">
                  {selectedSession && getDuration(selectedSession.startedAt, selectedSession.endedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div className="mt-1">
                  {selectedSession && getStatusBadge(selectedSession.status)}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Vi phạm ({sessionIncidents.length})
              </h3>
              {loadingIncidents ? (
                <p className="text-sm text-gray-500">Đang tải...</p>
              ) : sessionIncidents.length === 0 ? (
                <p className="text-sm text-gray-500">Không có vi phạm nào</p>
              ) : (
                <div className="space-y-2">
                  {sessionIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{incident.type}</p>
                        <p className="text-xs text-gray-500">{incident.reason}</p>
                      </div>
                      <Badge variant={incident.status === 'CONFIRMED' ? 'destructive' : 'secondary'}>
                        {incident.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
