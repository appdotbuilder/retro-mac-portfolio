import { useState } from 'react';
import { MacWindow } from './MacWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WindowState } from '../App';
import type { PortfolioSettings } from '../../../server/src/schema';

interface ContactModalProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onUpdatePosition: (windowId: string, position: { x: number; y: number }) => void;
  onUpdateSize: (windowId: string, size: { width: number; height: number }) => void;
  onContactSubmit: (name: string, email: string | null, subject: string, message: string) => Promise<boolean>;
  settings: PortfolioSettings | null;
}

export function ContactModal({
  window,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  onContactSubmit,
  settings
}: ContactModalProps) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await onContactSubmit(
        contactForm.name,
        contactForm.email || null,
        contactForm.subject,
        contactForm.message
      );
      
      if (success) {
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
        
        // Play success sound if enabled
        if (settings?.sound_enabled) {
          console.log('🔊 Message sent sound');
        }
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '📧',
      label: 'Email',
      value: 'john.developer@example.com',
      link: 'mailto:john.developer@example.com'
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'linkedin.com/in/johndeveloper',
      link: 'https://linkedin.com/in/johndeveloper'
    },
    {
      icon: '🐙',
      label: 'GitHub',
      value: 'github.com/johndeveloper',
      link: 'https://github.com/johndeveloper'
    },
    {
      icon: '🐦',
      label: 'Twitter',
      value: '@johndeveloper',
      link: 'https://twitter.com/johndeveloper'
    }
  ];

  const handleContactClick = (link: string) => {
    if (settings?.sound_enabled) {
      console.log('🔊 Contact link click sound');
    }
    globalThis.window.open(link, '_blank');
  };

  return (
    <MacWindow
      window={window}
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      onUpdatePosition={onUpdatePosition}
      onUpdateSize={onUpdateSize}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-purple-900 mb-2">Get In Touch</h1>
          <p className="text-purple-700">I'd love to hear from you! Drop me a message.</p>
        </div>

        {submitSuccess ? (
          /* Success Message */
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
              <p className="text-green-700 mb-4">
                Thank you for reaching out. I'll get back to you as soon as possible!
              </p>
              <Button
                onClick={() => setSubmitSuccess(false)}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Contact Form */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900 flex items-center">
                📝 Send Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="Your name *"
                      value={contactForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm(prev => ({ ...prev, name: e.target.value }))
                      }
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={contactForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm(prev => ({ ...prev, email: e.target.value }))
                      }
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <Input
                  placeholder="Subject *"
                  value={contactForm.subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setContactForm(prev => ({ ...prev, subject: e.target.value }))
                  }
                  required
                  className="border-purple-200 focus:border-purple-500"
                />
                
                <Textarea
                  placeholder="Your message *"
                  value={contactForm.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContactForm(prev => ({ ...prev, message: e.target.value }))
                  }
                  rows={6}
                  required
                  className="border-purple-200 focus:border-purple-500 resize-none"
                />
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    '🚀 Send Message'
                  )}
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                * Required fields
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 flex items-center">
              🌐 Other Ways to Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((contact, index: number) => (
                <div
                  key={index}
                  onClick={() => handleContactClick(contact.link)}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="text-2xl group-hover:scale-110 transition-transform">
                    {contact.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-purple-800">
                      {contact.label}
                    </div>
                    <div className="text-xs text-purple-600 font-mono">
                      {contact.value}
                    </div>
                  </div>
                  <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                    →
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Time Info */}
        <div className="mt-6 text-center">
          <Badge variant="outline" className="border-purple-300 text-purple-700">
            ⚡ Usually responds within 24 hours
          </Badge>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-purple-200 text-center">
          <p className="text-sm text-purple-600">
            💜 Looking forward to hearing from you!
          </p>
        </div>
      </div>
    </MacWindow>
  );
}