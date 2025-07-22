export default async function handler(req, res) {
  try {
    let max = parseInt(req.query.max, 10);
    if (isNaN(max) || max < 1) max = 20;
    if (max > 20) max = 20;

    const scriptblox_url = `https://scriptblox.com/api/script/trending?max=${max}`;

    const response = await fetch(scriptblox_url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return res.status(response.status).json({
        message: errorData?.message || "Failed to fetch trending scripts",
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
