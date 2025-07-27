import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RatingsSectionProps {
  ratings: {
    overallExperience: number;
    skillsSatisfaction: number;
    reHireLikelihood: number;
  };
  onRatingsChange: (field: string, value: number) => void;
  exitFeedback: string;
  setExitFeedback: (value: string) => void;
}

const ratingLabels = [1, 2, 3, 4, 5];

export const RatingsSection: React.FC<RatingsSectionProps> = ({
  ratings,
  onRatingsChange,
  exitFeedback,
  setExitFeedback,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">
        Recruiter Ratings & Exit Feedback
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Overall experience hiring from Shoolini</Label>
          <RadioGroup
            value={
              ratings.overallExperience
                ? ratings.overallExperience.toString()
                : ""
            }
            onValueChange={(val) =>
              onRatingsChange("overallExperience", Number(val))
            }
            className="flex flex-row gap-2 mt-2"
          >
            {ratingLabels.map((num) => (
              <RadioGroupItem
                key={num}
                value={num.toString()}
                id={`overall-${num}`}
              />
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>Satisfaction with technical & communication skills</Label>
          <RadioGroup
            value={
              ratings.skillsSatisfaction
                ? ratings.skillsSatisfaction.toString()
                : ""
            }
            onValueChange={(val) =>
              onRatingsChange("skillsSatisfaction", Number(val))
            }
            className="flex flex-row gap-2 mt-2"
          >
            {ratingLabels.map((num) => (
              <RadioGroupItem
                key={num}
                value={num.toString()}
                id={`skills-${num}`}
              />
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>Likelihood of hiring again</Label>
          <RadioGroup
            value={
              ratings.reHireLikelihood
                ? ratings.reHireLikelihood.toString()
                : ""
            }
            onValueChange={(val) =>
              onRatingsChange("reHireLikelihood", Number(val))
            }
            className="flex flex-row gap-2 mt-2"
          >
            {ratingLabels.map((num) => (
              <RadioGroupItem
                key={num}
                value={num.toString()}
                id={`rehire-${num}`}
              />
            ))}
          </RadioGroup>
        </div>
      </div>
      <div>
        <Label htmlFor="exit-feedback">
          Exit feedback for students who left
        </Label>
        <Textarea
          id="exit-feedback"
          value={exitFeedback}
          onChange={(e) => setExitFeedback(e.target.value)}
          placeholder="Share feedback for students who did not continue with your company."
          className="mt-2"
          rows={3}
        />
      </div>
    </div>
  );
};
