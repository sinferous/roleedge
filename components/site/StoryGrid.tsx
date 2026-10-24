import type { Story } from "@/lib/content/types";

export function StoryGrid({ stories }: { stories: Story[] }) {
  return (
    <div className="story-grid">
      {stories.map((story) => (
        <article className="story-card reveal" key={story.slug}>
          <span className="testimonial-outcome">
            {story.outcome}
            {!story.consentConfirmed && <span className="pending-tag">Pending approval</span>}
          </span>
          <p className="testimonial-story">{story.summary}</p>
          <div className="testimonial-profile">
            <span className="testimonial-avatar" aria-hidden="true">
              {story.name[0]}
            </span>
            <div>
              <strong>{story.name}</strong>
              <span>{story.fieldLabel}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
