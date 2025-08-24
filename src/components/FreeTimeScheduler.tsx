import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Calendar } from 'lucide-react';

interface FreeTime {
  day: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface FreeTimeSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleSet: (schedule: FreeTime[]) => void;
}

export const FreeTimeScheduler = ({ isOpen, onClose, onScheduleSet }: FreeTimeSchedulerProps) => {
  const [schedule, setSchedule] = useState<FreeTime[]>([
    { day: 'Monday', startTime: '18:00', endTime: '21:00', hours: 3 },
    { day: 'Tuesday', startTime: '18:00', endTime: '21:00', hours: 3 },
    { day: 'Wednesday', startTime: '18:00', endTime: '21:00', hours: 3 },
    { day: 'Thursday', startTime: '18:00', endTime: '21:00', hours: 3 },
    { day: 'Friday', startTime: '19:00', endTime: '22:00', hours: 3 },
    { day: 'Saturday', startTime: '09:00', endTime: '17:00', hours: 8 },
    { day: 'Sunday', startTime: '10:00', endTime: '16:00', hours: 6 },
  ]);

  const calculateHours = (start: string, end: string): number => {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'startTime' || field === 'endTime') {
      updated[index].hours = calculateHours(updated[index].startTime, updated[index].endTime);
    }
    
    setSchedule(updated);
  };

  const getTotalWeeklyHours = () => {
    return schedule.reduce((total, day) => total + (day.hours > 0 ? day.hours : 0), 0);
  };

  const handleSave = () => {
    onScheduleSet(schedule);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Set Your Free Time Schedule
          </DialogTitle>
          <DialogDescription>
            Tell us when you're available to study each day. This helps us create realistic deadlines for your To-Do items.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Weekly Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Total Weekly Study Time</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {getTotalWeeklyHours().toFixed(1)} hours
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <div className="space-y-4">
            <h3 className="font-medium">Daily Availability</h3>
            {schedule.map((daySchedule, index) => (
              <Card key={daySchedule.day}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="font-medium">{daySchedule.day}</div>
                    <div className="space-y-1">
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Time</Label>
                      <Input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Study Hours</div>
                      <div className="text-lg font-semibold text-primary">
                        {daySchedule.hours > 0 ? daySchedule.hours.toFixed(1) : '0'}h
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Presets</CardTitle>
              <CardDescription>Apply common study schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fullTime = schedule.map(day => ({
                      ...day,
                      startTime: day.day === 'Saturday' || day.day === 'Sunday' ? '09:00' : '17:00',
                      endTime: day.day === 'Saturday' || day.day === 'Sunday' ? '17:00' : '22:00',
                      hours: day.day === 'Saturday' || day.day === 'Sunday' ? 8 : 5
                    }));
                    setSchedule(fullTime);
                  }}
                >
                  Full-time Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const partTime = schedule.map(day => ({
                      ...day,
                      startTime: day.day === 'Saturday' || day.day === 'Sunday' ? '10:00' : '19:00',
                      endTime: day.day === 'Saturday' || day.day === 'Sunday' ? '16:00' : '22:00',
                      hours: day.day === 'Saturday' || day.day === 'Sunday' ? 6 : 3
                    }));
                    setSchedule(partTime);
                  }}
                >
                  Working Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const weekend = schedule.map(day => ({
                      ...day,
                      startTime: day.day === 'Saturday' || day.day === 'Sunday' ? '09:00' : '20:00',
                      endTime: day.day === 'Saturday' || day.day === 'Sunday' ? '17:00' : '21:00',
                      hours: day.day === 'Saturday' || day.day === 'Sunday' ? 8 : 1
                    }));
                    setSchedule(weekend);
                  }}
                >
                  Weekend Focus
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};