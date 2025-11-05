import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

interface InstructorGuardProps {
  children: React.ReactNode;
}

const InstructorGuard: React.FC<InstructorGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isInstructor, setIsInstructor] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInstructor = async () => {
      try {
        const user = await authService.getMyInfo();
        const isInstructorUser = user.role?.name === 'INSTRUCTOR';
        setIsInstructor(isInstructorUser);
        
        if (!isInstructorUser) {
          router.push('/home');
        }
      } catch (error) {
        setIsInstructor(false);
        router.push('/login');
      }
    };

    checkInstructor();
  }, [router]);

  if (isInstructor === null || !isInstructor) {
    return null;
  }

  return <>{children}</>;
};

export default InstructorGuard;

