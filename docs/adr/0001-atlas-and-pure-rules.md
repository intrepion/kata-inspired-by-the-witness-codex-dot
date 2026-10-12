# Atlas exploration and pure puzzle rules

Use a 2D SVG island atlas with connected region scenes rather than a free-roaming 3D island. The authored world can remain readable, responsive and accessible without sacrificing puzzle correctness to camera or collision scope. Store completed traces rather than trusting boolean flags; revalidate them against current rules on load so corrupt saves cannot bypass progression.
