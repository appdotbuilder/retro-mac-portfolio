import { useState } from 'react';
import { MacWindow } from './MacWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { WindowState } from '../App';
import type { PortfolioStats, Like, PortfolioSettings } from '../../../server/src/schema';

interface AboutMeModalProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onUpdatePosition: (windowId: string, position: { x: number; y: number }) => void;
  onUpdateSize: (windowId: string, size: { width: number; height: number }) => void;
  portfolioStats: PortfolioStats | null;
  likes: Like | null;
  onLike: () => void;
  onFeedbackSubmit: (name: string, email: string | null, message: string) => Promise<boolean>;
  settings: PortfolioSettings | null;
}

export function AboutMeModal({
  window,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  portfolioStats,
  likes,
  onLike,
  onFeedbackSubmit,
  settings
}: AboutMeModalProps) {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    
    try {
      const success = await onFeedbackSubmit(
        feedbackForm.name,
        feedbackForm.email || null,
        feedbackForm.message
      );
      
      if (success) {
        setFeedbackForm({ name: '', email: '', message: '' });
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 3000);
        
        // Play success sound if enabled
        if (settings?.sound_enabled) {
          // Placeholder for sound effect
          console.log('🔊 Feedback submitted sound');
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleLikeClick = () => {
    onLike();
    // Play like sound if enabled
    if (settings?.sound_enabled) {
      console.log('🔊 Like button sound');
    }
  };

  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL',
    'MongoDB', 'Git', 'Docker', 'AWS', 'GraphQL', 'REST APIs'
  ];

  const experience = [
    {
      title: 'Senior Developer',
      company: 'Tech Solutions Inc.',
      period: '2021 - Present',
      description: 'Lead full-stack development projects using modern web technologies.'
    },
    {
      title: 'Frontend Developer', 
      company: 'Creative Digital',
      period: '2019 - 2021',
      description: 'Developed responsive web applications and user interfaces.'
    },
    {
      title: 'Junior Developer',
      company: 'StartUp Ventures',
      period: '2018 - 2019', 
      description: 'Built web applications and learned modern development practices.'
    }
  ];

  return (
    <MacWindow
      window={window}
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      onUpdatePosition={onUpdatePosition}
      onUpdateSize={onUpdateSize}
    >
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-4xl">
            👨‍💻
          </div>
          <h1 className="text-2xl font-bold text-purple-900 mb-2">John Developer</h1>
          <p className="text-purple-700 font-mono">Full-Stack Developer & Problem Solver</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-purple-800">
                {portfolioStats?.total_projects || 0}
              </div>
              <div className="text-xs text-purple-600">Projects</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-purple-800">
                {portfolioStats?.years_experience || 0}
              </div>
              <div className="text-xs text-purple-600">Years Exp.</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-purple-800">
                {likes?.count || 0}
              </div>
              <div className="text-xs text-purple-600">Likes</div>
            </CardContent>
          </Card>
          
          {settings?.show_visitor_count && (
            <Card className="text-center bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-purple-800">
                  {portfolioStats?.visitor_count || 0}
                </div>
                <div className="text-xs text-purple-600">Visitors</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Biography */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Welcome to my digital portfolio! I'm a passionate full-stack developer with over 5 years of experience 
              creating robust web applications. I love turning complex problems into simple, beautiful, and intuitive 
              solutions. When I'm not coding, you'll find me exploring new technologies, contributing to open-source 
              projects, or enjoying a good cup of coffee while planning my next creative project.
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Technical Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Professional Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((exp, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-purple-800">{exp.title}</h3>
                    <p className="text-purple-600 text-sm">{exp.company}</p>
                  </div>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    {exp.period}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{exp.description}</p>
                {index < experience.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Like Button */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-purple-700 mb-3">Enjoying my portfolio?</p>
            <Button
              onClick={handleLikeClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              💜 Give it a like! ({likes?.count || 0})
            </Button>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Leave Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackSuccess ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-purple-700 font-semibold">Thank you for your feedback!</p>
                <p className="text-purple-600 text-sm">Your message has been received.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your name"
                    value={feedbackForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFeedbackForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <Input
                    type="email"
                    placeholder="Your email (optional)"
                    value={feedbackForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFeedbackForm(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <Textarea
                  placeholder="Your feedback or message..."
                  value={feedbackForm.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFeedbackForm(prev => ({ ...prev, message: e.target.value }))
                  }
                  rows={4}
                  required
                  className="border-purple-200 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmittingFeedback ? 'Sending...' : 'Send Feedback'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MacWindow>
  );
}