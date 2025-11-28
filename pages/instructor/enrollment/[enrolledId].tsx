// pages/instructor/enrollment/[enrolledId].tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import InstructorGuard from "@/components/instructor/InstructorGuard";
import InstructorLayout from "@/components/instructor/InstructorLayout";
import SEO from "@/components/ui/SEO";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { enrollmentService, ProgressResponse } from "@/services/enrollmentService";
import { mintCertificate } from "@/services/certificateService";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/ToastContainer";
import {  FileText, Youtube } from "lucide-react";



const EnrollmentDetailPage: React.FC = () => {
  const router = useRouter();
  const { enrolledId } = router.query as { enrolledId?: string };
  const { toasts, removeToast, error: showError } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ProgressResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [minting, setMinting] = useState<boolean>(false);

  const handleMintClick = () => {
    fileInputRef.current?.click();
  };

  const handleMintFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const f = e.target.files?.[0];
      if (!f || !enrolledId) return;
      setMinting(true);
      await mintCertificate(Number(enrolledId), f);
      alert("Mint certificate success");
    } catch (err: any) {
      showError(err?.message || "Mint certificate failed");
    } finally {
      setMinting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!enrolledId) return;
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await enrollmentService.getEnrollmentProgress(Number(enrolledId));
        if (mounted) setData(res);
      } catch (e: any) {
        showError(e?.message || "Failed to load enrollment detail");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [enrolledId]);

  // ---------- helpers ----------
  const formatMin = (sec?: number) => {
    if (!sec || sec <= 0) return "0:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // build lookup maps
  const lectureProgressMap = useMemo(() => {
    const m = new Map<number, { currentTime?: number; duration?: number; completed?: boolean; completedAt?: string }>();
    (data?.testAndLectureCompleted || []).forEach(item => {
      if (item.type === "lecture" && typeof item.contentId === "number") {
        m.set(item.contentId, {
          currentTime: item.currentTime,
          duration: item.duration,
          completed: item.completed,
          completedAt: item.completedAt,
        });
      }
    });
    return m;
  }, [data]);

  const testCompletedMap = useMemo(() => {
    const m = new Map<number, { score?: number; completed?: boolean }>();
    (data?.testAndLectureCompleted || []).forEach(item => {
      if (item.type === "test" && typeof item.contentId === "number") {
        m.set(item.contentId, { score: item.score, completed: item.completed });
      }
    });
    return m;
  }, [data]);

  // totals
  const totals = useMemo(() => {
    const lectures = (data?.chapters || []).flatMap(ch => ch.lectures || []);
    const totalDurationSec = lectures.reduce((s, l) => s + (l.duration || 0), 0);
    const totalWatchedSec = lectures.reduce((s, l) => s + (lectureProgressMap.get(l.id)?.currentTime || 0), 0);
    const chapterItems = (data?.chapters || []).reduce((acc, ch) => acc + (ch.lectures?.length || 0) + (ch.tests?.length || 0), 0);
    const finalTests = data?.courseTests?.length || 0;
    const totalItems = chapterItems + finalTests;
    const completedCount = (data?.testAndLectureCompleted || []).filter(x => x.completed).length;
    const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    return { totalItems, completedCount, percent, totalDurationSec, totalWatchedSec };
  }, [data, lectureProgressMap]);

  const isCompleted = useMemo(() => {
    return totals.totalItems > 0 && totals.completedCount === totals.totalItems;
  }, [totals]);

  // video % and test metrics
  const videoPct = useMemo(() => {
    const { totalWatchedSec, totalDurationSec } = totals;
    if (!totalDurationSec || totalDurationSec <= 0) return 0;
    return Math.min(100, Math.round((totalWatchedSec / totalDurationSec) * 100));
  }, [totals]);

  const testMetrics = useMemo(() => {
    const totalTestsChapter = (data?.chapters || []).reduce((acc, ch) => acc + (ch.tests?.length || 0), 0);
    const totalFinalTests = data?.courseTests?.length || 0;
    const totalTests = totalTestsChapter + totalFinalTests;
    const completedTests = Array.from(testCompletedMap.values()).filter(v => v.completed).length;
    const testsPct = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
    const scored = Array.from(testCompletedMap.values()).map(v => v.score).filter((s): s is number => typeof s === "number");
    const avgScore = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : undefined;
    return { totalTests, completedTests, testsPct, avgScore };
  }, [data, testCompletedMap]);

  // per-chapter progress array for sparkline
  const chapterPercents = useMemo(() => {
    return (data?.chapters || []).map(ch => {
      const d = (ch.lectures || []).reduce((s, l) => s + (l.duration || 0), 0);
      const w = (ch.lectures || []).reduce((s, l) => s + (lectureProgressMap.get(l.id)?.currentTime || 0), 0);
      return d > 0 ? Math.round((w / d) * 100) : 0;
    });
  }, [data, lectureProgressMap]);

  // ---------- UI subcomponents (lightweight) ----------
  const Header: React.FC = () => {
    return (
      <div className="w-full bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {data?.avatar ? (
              <img src={data.avatar} alt={data.fullName} className="w-14 h-14 rounded-full object-cover border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm">
                {(data?.fullName || "U").slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="text-lg font-semibold text-gray-900">{data?.fullName}</div>
              <div className="mt-1 flex items-center gap-2">
                
                <span
                  className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${
                    isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data?.completed && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMintFileChange}
                />
                <Button onClick={handleMintClick} disabled={minting} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {minting ? "Minting..." : "Mint Certificate"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="text-xs text-gray-500">{totals.completedCount}/{totals.totalItems} lessions</div>
          </div>
          <Progress value={totals.percent}  className="h-2 rounded-full" />
        </div>
      </div>
    );
  };

  

  // simple donut using conic-gradient inline style
  const Donut: React.FC<{ percent: number; label: string; sub?: string }> = ({ percent, label, sub }) => {
    const pct = Math.max(0, Math.min(100, percent));
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          {/* Đổi màu gradient thành xanh biển nhạt */}
          <div
            className="w-24 h-24 rounded-full"
            style={{
              background: `conic-gradient(#60a5fa ${pct * 3.6}deg, #e6e6e6 0deg)`,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center text-sm font-semibold">
            {pct}%
          </div>
        </div>
        <div className="mt-3 text-sm font-medium text-gray-900">{label}</div>
        {sub && <div className="text-xs text-gray-500 mt-1 text-center">{sub}</div>}
      </div>
    );
  };

  
  // ---------- loading / empty ----------
  if (loading && !data) {
    return (
      <InstructorGuard>
        <InstructorLayout loading>
          <SEO title="Enrollment Detail - Instructor" />
          <div className="py-24 text-center text-gray-500">Loading...</div>
        </InstructorLayout>
      </InstructorGuard>
    );
  }

  if (!data) {
    return (
      <InstructorGuard>
        <InstructorLayout>
          <SEO title="Enrollment Detail - Instructor" />
          <div className="py-24 text-center text-red-600">No data found</div>
        </InstructorLayout>
      </InstructorGuard>
    );
  }

  // ---------- final render ----------
  return (
    <InstructorGuard>
      <SEO title="Enrollment Detail - Instructor" />
      <InstructorLayout loading={loading}>
        <div className="space-y-6">
          <Header />

          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              
              <div className="flex flex-col items-centers">
                <img src={data.imageUrl || "/images/course-placeholder.jpg"} alt={data.title} className="w-full rounded-md object-cover" />
              </div>
              <div className="text-sm mt-2 font-semibold">{data.title}</div>
            </Card>
            <Card className="p-4 flex items-center justify-center">
              <Donut
                percent={totals.percent}
                label="Overall Progress"
        
                sub={`${totals.completedCount}/${totals.totalItems} lessions`}
              />
            </Card>
            <Card className="p-4 flex items-center justify-center">
              <Donut
                percent={videoPct}
                label="Videos watched"
                sub={`${formatMin(totals.totalWatchedSec)} / ${formatMin(totals.totalDurationSec)}`}
              />
            </Card>
            <Card className="p-4 flex items-center justify-center">
              <Donut
                percent={testMetrics.testsPct}
                label="Tests"
                sub={`${testMetrics.completedTests}/${testMetrics.totalTests} completed`}
              />
            </Card>
            
          </div>

          {/* main area: left tabs, right donuts/charts on large screens */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Card className="p-6">
                <Tabs defaultValue="chapters">
                  <TabsList>
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="final">Final Tests</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chapters" className="mt-4">
                    <div className="space-y-4">
                      {data.chapters?.length ? data.chapters.map(ch => {
                        const d = (ch.lectures || []).reduce((s, l) => s + (l.duration || 0), 0);
                        const w = (ch.lectures || []).reduce((s, l) => s + (lectureProgressMap.get(l.id)?.currentTime || 0), 0);
                        return (
                          <div key={ch.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium text-gray-900">{ch.title}</div>
                              </div>
                              <div className="text-xs text-gray-500">{(ch.lectures?.length || 0) + (ch.tests?.length || 0)} lessions</div>
                            </div>

                            {/* lectures */}
                            {ch.lectures?.length ? (
                              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                                {ch.lectures.map(l => {
                                  const info = lectureProgressMap.get(l.id);
                                  return (
                                    <li key={l.id} className="py-1">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <Youtube size={16} className="mt-1 text-gray-500" />
                                          <div>{l.title}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-3">
                                          <span>{formatMin(info?.currentTime)} / {formatMin(l.duration)}</span>
                                          <span>{info?.completed ? `Completed: ${formatDate(info.completedAt)}` : "In progress"}</span>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}

                            {/* tests */}
                            {ch.tests?.length ? (
                              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                                {ch.tests.map(t => {
                                  const info = testCompletedMap.get(t.id);
                                  return (
                                    <li key={t.id} className="py-1">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <FileText size={16} className="text-gray-500" />
                                          <div>{t.title}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {typeof info?.score === "number" ? `Score: ${info.score}` : (info?.completed ? "Completed" : "Not taken")}
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                          </div>
                        );
                      }) : (
                        <div className="text-sm text-gray-500">No chapters</div>
                      )}
                    </div>
                  </TabsContent>


                  <TabsContent value="final" className="mt-4">
                    {data.courseTests?.length ? (
                      <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                        {data.courseTests.map(t => {
                          const info = testCompletedMap.get(t.id);
                          return (
                            <li key={t.id} className="flex items-center justify-between">
                              <div>{t.title}</div>
                              <div className="text-xs text-gray-500">{typeof info?.score === "number" ? `Score: ${info.score}` : "Not taken"}</div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : <div className="text-sm text-gray-500">No final tests</div>}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </InstructorLayout>
    </InstructorGuard>
  );
};

export default EnrollmentDetailPage;
