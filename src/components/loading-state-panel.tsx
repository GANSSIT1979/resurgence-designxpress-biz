type LoadingStatePanelProps = {
  lines?: number;
  title?: string;
  description?: string;
};

export function LoadingStatePanel({
  lines = 4,
  title = "Loading module data",
  description = "Please wait while the dashboard retrieves the latest records and metrics.",
}: LoadingStatePanelProps) {
  return (
    <div className="semantic-loading-state">
      <div className="semantic-loading-head">
        <div className="semantic-loading-block semantic-loading-block-title" />
        <div className="semantic-loading-block semantic-loading-block-chip" />
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <div className="semantic-loading-lines">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="semantic-loading-block semantic-loading-block-line" />
        ))}
      </div>
    </div>
  );
}
