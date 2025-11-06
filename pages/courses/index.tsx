import React from 'react';
import Layout from '@/components/layout/Layout';
import CourseList from '@/components/course/CourseList';
import SEO from '@/components/ui/SEO';

const CoursesPage: React.FC = () => {
  // Demo data - replace with actual API call
  const courses = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Doe',
      rating: 4.8,
      reviews: 1250,
      description: 'Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and get job-ready skills.',
      category: 'Web Development',
      price: '$49.99',
      duration: '40 hours',
      students: 5000,
      image: '/images/common/01.png',
    },
    {
      id: '2',
      title: 'Machine Learning Masterclass',
      instructor: 'Jane Smith',
      rating: 4.9,
      reviews: 890,
      description: 'Master machine learning algorithms, neural networks, and deep learning. Hands-on projects with TensorFlow and PyTorch.',
      category: 'Data Science',
      price: '$59.99',
      duration: '50 hours',
      students: 3200,
      image: '/images/common/02.png',
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Mike Johnson',
      rating: 4.7,
      reviews: 654,
      description: 'Learn user interface and user experience design principles. Create beautiful and functional designs using Figma and Adobe XD.',
      category: 'Design',
      price: '$39.99',
      duration: '30 hours',
      students: 2100,
      image: '/images/common/03.png',
    },
    {
      id: '4',
      title: 'Python for Data Science',
      instructor: 'Sarah Williams',
      rating: 4.6,
      reviews: 2100,
      description: 'Learn Python programming for data analysis, visualization, and machine learning. Perfect for beginners and intermediate learners.',
      category: 'Programming',
      price: '$44.99',
      duration: '35 hours',
      students: 6800,
      image: '/images/common/04.png',
    },
    {
      id: '5',
      title: 'Introduction to JavaScript',
      instructor: 'David Lee',
      rating: 4.5,
      reviews: 1800,
      description: 'Learn JavaScript fundamentals for web development. Perfect for beginners starting their coding journey.',
      category: 'Programming',
      price: 'Free',
      duration: '20 hours',
      students: 12000,
      image: '/images/common/01.png',
    },
    {
      id: '6',
      title: 'React Basics Course',
      instructor: 'Emma Wilson',
      rating: 4.7,
      reviews: 950,
      description: 'Master React fundamentals and build modern web applications. Free course for everyone.',
      category: 'Web Development',
      price: 'Free',
      duration: '25 hours',
      students: 8500,
      image: '/images/common/02.png',
    },
  ];

  return (
    <>
      <SEO
        title="Courses - lms.cardano2vn.io"
        description="Browse our comprehensive collection of blockchain and Cardano courses. Find free and premium courses taught by expert instructors."
        keywords="courses, Cardano courses, blockchain courses, free courses, premium courses, online learning"
        url="/courses"
      />
      <Layout>
        <div className="min-h-[calc(100vh-200px)] py-6">
          <CourseList 
            courses={courses} 
            totalResults={150}
            searchQuery=""
          />
        </div>
      </Layout>
    </>
  );
};

export default CoursesPage;

