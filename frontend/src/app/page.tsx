"use client";

import { useState } from "react";
import { UploadFileDialog } from "@/components/home/UploadFileDialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Checkboxes from "@/components/ui/checkbox";
import { ProgressDemo } from "@/components/home/progressAnimated";
import { SkeletonCard } from "@/components/home/SkeletonCard";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [phase, setPhase] = useState<"form" | "animation" | "results">("form");
  const [animationStep, setAnimationStep] = useState<"first" | "second">(
    "first"
  );

  const [isSaved, setIsSaved] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [educationWarning, setEducationWarning] = useState(false);
  const [llmFeedback, setLlmFeedback] = useState("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const [scoringDetails, setScoringDetails] = useState({
    keyword_match_score: 0,
    action_verb_score: 0,
    quantified_score: 0,
    formatting_score: 0,
    section_coverage: 0,
  });

  const handleSubmit = async () => {
    if (!file) return alert("No file uploaded!");
    if (!jobDescription.trim())
      return alert("Job description cannot be empty!");
    if (jobDescription.trim().length < 500) {
      return alert("Job description must be at least 500 characters long.");
    }

    setPhase("animation");
    setAnimationKey((prev) => prev + 1);
    setAnimationStep("first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log("Upload response:", data);
      pollForLLMFeedback(data.request_id);

      setScore(data.score);
      setEducationWarning(data.education_warning);
      setScoringDetails({
        keyword_match_score: data.keyword_match_score,
        action_verb_score: data.action_verb_score,
        quantified_score: data.quantified_score,
        formatting_score: data.formatting_score,
        section_coverage: data.section_coverage,
      });
      setIsSaved(true);

      setTimeout(() => {
        setAnimationStep("second");
        setTimeout(() => {
          setPhase("results");
        }, 2000);
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
      setPhase("form");
    }
  };

  const pollForLLMFeedback = async (requestId: string) => {
    setIsLoadingFeedback(true);
    let done = false;

    while (!done) {
      try {
        const res = await fetch(
          `${apiUrl}/feedback/${requestId}`
        );
        const data = await res.json();

        if (data.llm_feedback) {
          setLlmFeedback(data.llm_feedback);
          setIsLoadingFeedback(false);
          done = true;
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } catch (err) {
        console.error("Polling error:", err);
        setIsLoadingFeedback(false);
        done = true;
      }
    }
  };

  return (
    <>
      {phase === "form" && (
        <div className="bg-[#f4f9ff] rounded-[36px] px-12 py-16 w-full max-w-3xl mx-auto mt-16 flex flex-col items-center gap-10 shadow-sm border border-[#dde9f3]">
          <h1 className="text-2xl font-[var(--font-outfit)] text-[#4a5568] mb-2 tracking-wide">
            ☁️ AI Resume Rating ☁️
          </h1>
          <div className="flex flex-col items-center w-full font-[var(--font-geist-sans)]">
            <main className="flex flex-col items-center gap-8 w-full">
              <div className="w-full flex items-center gap-4">
                <div className="pt-2">
                  <Checkboxes checked={file !== null} label="Resume uploaded" />
                </div>
                <div className="flex-1">
                  <UploadFileDialog
                    file={file}
                    setFile={setFile}
                    isSaved={isSaved}
                    setIsSaved={setIsSaved}
                  />
                </div>
              </div>
              <div className="flex w-full items-start gap-4">
                <div className="pt-2">
                  <Checkboxes
                    checked={jobDescription.trim().length >= 500}
                    label="Job description is long enough"
                  />
                </div>
                <div className="relative w-full">
                  <textarea
                    placeholder="Paste any job description here"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    minLength={500}
                    required
                    className="h-52 w-full px-6 py-4 text-lg rounded-xl border border-[#d3e1ec] bg-white focus:outline-none focus:ring-2 focus:ring-[#bdd9ef] placeholder:text-[#a0aec0] shadow-sm resize-none"
                  />
                  <p
                    className={`absolute bottom-2 right-4 text-sm ${
                      jobDescription.length < 500
                        ? "text-red-300"
                        : "text-green-600"
                    }`}
                  >
                    {jobDescription.length}/500 characters min
                  </p>
                </div>
              </div>
              <Button
                className="bg-[#e0ecf7] hover:bg-[#d1e4f2] text-[#333] text-sm px-6 py-2 rounded-lg shadow-sm transition self-center"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </main>
          </div>
        </div>
      )}

      {phase === "animation" && (
        <div className="flex flex-col items-center mt-12">
          <div className="relative w-[400px] h-[400px]">
            {animationStep === "first" && (
              <DotLottieReact
                key={`first-${animationKey}`}
                src="/lottie/1751830975587.lottie"
                autoplay
                loop={false}
                className="w-full h-full"
              />
            )}
            {animationStep === "second" && (
              <DotLottieReact
                key={`second-${animationKey}`}
                src="/lottie/1751830897466.lottie"
                autoplay
                loop={false}
                className="w-full h-full"
              />
            )}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-600 text-sm bg-white/70 px-3 py-1 rounded-md backdrop-blur-sm">
              Submitting your resume...
            </p>
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="flex flex-col  items-center text-center mt-24 bg-[#f4f9ff] rounded-[36px] m-10 px-6 py-10 space-y-10">
          <Button
            className="bg-[#e0ecf7] hover:bg-[#d1e4f2] text-[#333] text-sm px-6 py-2 rounded-lg shadow-sm transition"
            onClick={() => {
              for (let i = 0; i < 100; i++) clearTimeout(i);
              setJobDescription("");
              setScore(null);
              setLlmFeedback("");
              setEducationWarning(false);
              setAnimationStep("first");
              setPhase("form");
              setAnimationKey((prev) => prev + 1);
            }}
          >
            Try Another Job!
          </Button>

          <div className="flex items-center justify-center w-3/4 h-10 rounded-[30px] mx-auto">
            <p className="pr-5">Not Fit for Role</p>
            <ProgressDemo target={score ?? 0} />
            <p className="pl-5">Perfect Fit for Role</p>
          </div>

          <div className="flex flex-row items-start justify-around gap-8 flex-wrap w-full max-w-6xl px-6">
            <div className="w-2/5 space-y-6 h-full">
              <div className="p-8 rounded-[30px] border bg-white text-center shadow">
                <p className="text-xl font-semibold text-[#2d3748] whitespace-nowrap">
                  Resume Score: {score}/100
                </p>
              </div>
              <div className="p-8 rounded-[30px] border bg-white text-left shadow space-y-4 text-sm text-gray-700">
                <p className="text-center text-lg font-semibold text-[#2d3748]">
                  Scoring Breakdown
                </p>
                <p>
                  <strong>🧠 Keyword Match: </strong> (45% score weight)
                  <span className="float-right pb-5 font-bold underline">
                    {scoringDetails.keyword_match_score}%
                  </span>
                  <br></br>
                  How well your resume aligns with the job posting keywords.{" "}
                </p>
                <p>
                  <strong>💪 Action Verbs:</strong> (20% score weight)
                  <span className="float-right pb-5 font-bold underline">
                    {scoringDetails.action_verb_score}%
                  </span>
                  <br></br>
                  Percentage of bullet points that begin with strong, impactful
                  verbs.{" "}
                </p>
                <p>
                  <strong>🔢 Quantified Results:</strong> (20% score weight)
                  <span className="float-right pb-5 font-bold underline">
                    {scoringDetails.quantified_score}%
                  </span>
                  <br></br>
                  Percentage of bullet points with numbers or measurable
                  outcomes.{" "}
                </p>
                <p>
                  <strong>📐 Formatting:</strong> (10% score weight)
                  <span className="float-right pb-5 font-bold underline">
                    {scoringDetails.section_coverage}%
                  </span>
                  <br></br>
                  Score based on line length and consistency in formatting.{" "}
                </p>
                <p>
                  <strong>📄 Section Coverage:</strong> (5% score weight)
                  <span className="float-right pb-5 font-bold underline">
                    {scoringDetails.section_coverage}%
                  </span>
                  <br></br>
                  Presence of key sections: Education, Experience, and Skills.{" "}
                </p>
                {educationWarning && (
                  <p className="text-red-500 text-sm pt-2">
                    ⚠️ Your education level may not match the job requirements.
                  </p>
                )}
              </div>
            </div>

            {isLoadingFeedback ? (
              <SkeletonCard />
            ) : (
              <div className="w-2/5 h-[590px] flex flex-col">
                <div className="p-8 rounded-[30px] border bg-white text-center shadow mb-6">
                  <p className="text-xl font-semibold text-[#2d3748] whitespace-nowrap">
                    ⋆˙✧ AI Feedback ✧⋆˙
                  </p>
                </div>
                <div className="p-8 rounded-[30px] border bg-white text-left shadow text-sm text-gray-700 flex-1 overflow-y-scroll">
                  <p className="text-[#4a5568] whitespace-pre-wrap">
                    {llmFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        // </div>
      )}
    </>
  );
}
