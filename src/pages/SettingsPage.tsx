
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useApp } from '@/contexts/AppContext';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData } = useApp();
  
  const [localSettings, setLocalSettings] = useState({
    darkMode: settings.darkMode,
    enableReminders: settings.enableReminders,
  });
  
  const handleToggleDarkMode = () => {
    const newSettings = {
      ...settings,
      darkMode: !localSettings.darkMode,
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };
  
  const handleToggleReminders = () => {
    const newSettings = {
      ...settings,
      enableReminders: !localSettings.enableReminders,
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        {/* Settings sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Accordion type="single" collapsible defaultValue="profile" className="w-full">
            <AccordionItem value="profile">
              <AccordionTrigger className="text-lg">Edit Profile</AccordionTrigger>
              <AccordionContent>
                <div className="py-4">
                  <ProfileForm />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* App Preferences */}
            <AccordionItem value="preferences">
              <AccordionTrigger className="text-lg">App Preferences</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={localSettings.darkMode}
                        onCheckedChange={handleToggleDarkMode}
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Reminders Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="reminders">Task Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about upcoming tasks
                        </p>
                      </div>
                      <Switch
                        id="reminders"
                        checked={localSettings.enableReminders}
                        onCheckedChange={handleToggleReminders}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Data Management */}
            <AccordionItem value="data">
              <AccordionTrigger className="text-lg">Data Management</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Clear All Data</CardTitle>
                    <CardDescription>
                      This will reset the app and delete all your data. This cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Reset All Data</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete all your tasks, progress, and profile data.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={resetAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Reset Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* About */}
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About First Projects</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
                        <span className="text-xl text-primary-foreground font-bold">FP</span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold">First Projects v1.0</h3>
                        <p className="text-sm text-muted-foreground">
                          A beautiful offline task manager
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <p className="text-sm text-muted-foreground">
                        Developed by Dron Pancholi
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
