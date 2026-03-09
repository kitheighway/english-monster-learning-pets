export default function StatBox({ label, value }) {
  return (
    <div className="statBox">
      <div className="k">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}
