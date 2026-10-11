import type { AgeBand, Duration, Sex, Urgency } from "./types";

export function urgencyLabel(urgency: Urgency) {
  switch (urgency) {
    case "self-care":
      return "Often home care";
    case "clinic":
      return "Clinician visit";
    case "urgent":
      return "Same-day care";
    case "emergency":
      return "Emergency care";
  }
}

export function urgencyDetail(urgency: Urgency) {
  switch (urgency) {
    case "self-care":
      return "If this pattern is the cause, many people start with rest and home support.";
    case "clinic":
      return "If this pattern is the cause, arrange a clinician visit rather than waiting it out alone.";
    case "urgent":
      return "If this pattern is the cause, same-day or urgent care is the safer next step.";
    case "emergency":
      return "If this pattern is the cause, emergency care is the right next step.";
  }
}

export function sexLabel(sex: Sex) {
  switch (sex) {
    case "female":
      return "Female";
    case "male":
      return "Male";
    case "unspecified":
      return "Not specified";
  }
}

export function ageLabel(age: AgeBand | null) {
  switch (age) {
    case "child":
      return "Child, under 12";
    case "teen":
      return "Teen, 12–17";
    case "adult":
      return "Adult, 18–64";
    case "older":
      return "65 or older";
    default:
      return "Age not specified";
  }
}

export function durationLabel(duration: Duration | null) {
  switch (duration) {
    case "under-2-days":
      return "Less than 2 days";
    case "2-to-7-days":
      return "2 to 7 days";
    case "1-to-4-weeks":
      return "1 to 4 weeks";
    case "more-than-a-month":
      return "More than a month";
    default:
      return "Duration not specified";
  }
}
