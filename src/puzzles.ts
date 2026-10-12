/** Original authored layouts. Coordinates count from the top-left, starting at zero. */
export type Point = [number, number];
export interface Puzzle {
  id: number;
  title: string;
  region: number;
  size: number;
  start: Point;
  end: Point;
  waypoints: Point[];
  symbols: { cell: Point; kind: 'leaf' | 'stone' }[];
  triangles: { cell: Point; count: number }[];
  hints: string[];
  note: string;
  solution: Point[];
  observation?: string;
}
export const puzzles: Puzzle[] = [
  {
    "size": 2,
    "waypoints": [],
    "symbols": [],
    "triangles": [],
    "solution": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        0
      ]
    ],
    "id": 0,
    "title": "First Light",
    "region": 0,
    "start": [
      0,
      2
    ],
    "end": [
      2,
      0
    ],
    "note": "Someone left the gate open. A thin wire runs from the round seed to a notch in the stone.",
    "hints": [
      "Watch the round start and the hollow end.",
      "A continuous line may follow any neighboring grid points without crossing itself. Reach the hollow end.",
      "From the round start: right, right, up, up."
    ]
  },
  {
    "size": 2,
    "waypoints": [
      [
        1,
        1
      ]
    ],
    "symbols": [],
    "triangles": [],
    "solution": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        0
      ]
    ],
    "id": 1,
    "title": "A Small Detour",
    "region": 0,
    "start": [
      0,
      2
    ],
    "end": [
      2,
      0
    ],
    "note": "A brass bell sits beside the wire. Its polished center has survived the weather.",
    "hints": [
      "The small brass ring lies along the wire.",
      "Pass through every brass ring on your way to the hollow end.",
      "From the round start: right, up, right, up."
    ]
  },
  {
    "size": 3,
    "waypoints": [
      [
        0,
        0
      ],
      [
        2,
        2
      ],
      [
        1,
        1
      ]
    ],
    "symbols": [],
    "triangles": [],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ],
      [
        0,
        1
      ],
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 2,
    "title": "Three Quiet Bells",
    "region": 0,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "Three bells once called the gardeners home. No two rings sounded alike.",
    "hints": [
      "Look for all three bells before setting off.",
      "The line must visit every ring; their order is your choice. Keep a way out to the end.",
      "From the round start: right, right, up, up, left, left, up, right, right, right."
    ]
  },
  {
    "size": 2,
    "waypoints": [],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "stone"
      }
    ],
    "triangles": [],
    "solution": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ]
    ],
    "id": 3,
    "title": "Separate Shores",
    "region": 1,
    "start": [
      0,
      2
    ],
    "end": [
      2,
      0
    ],
    "note": "The orchard grew around the quarry. The old gardeners drew boundaries gently.",
    "hints": [
      "The two symbols have different shapes as well as colors.",
      "Your line is a wall. A connected area may contain leaves or stones, never both. Empty areas are allowed.",
      "From the round start: right, up, up, right."
    ]
  },
  {
    "size": 3,
    "waypoints": [],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "stone"
      }
    ],
    "triangles": [],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 4,
    "title": "The Orchard Wall",
    "region": 1,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "Leaves fell on one bank. Stones settled on the other. Water carried neither across.",
    "hints": [
      "The two shores need a boundary between them.",
      "Keep all leaves apart from stones. Matching shapes can share an area, but they do not have to.",
      "From the round start: right, right, up, up, up, right."
    ]
  },
  {
    "size": 3,
    "waypoints": [],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "stone"
      }
    ],
    "triangles": [],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 5,
    "title": "A Bend in the Hedge",
    "region": 1,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "The straight hedge gave way to a bend. It kept the orchard and quarry in balance.",
    "hints": [
      "A boundary can turn inside the garden.",
      "The leaf at the lower middle and the stone at the upper middle need different connected areas.",
      "From the round start: right, right, up, up, left, up, right, right."
    ]
  },
  {
    "size": 3,
    "waypoints": [
      [
        1,
        1
      ]
    ],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "stone"
      },
      {
        "cell": [
          1,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "leaf"
      }
    ],
    "triangles": [],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        1,
        2
      ],
      [
        0,
        2
      ],
      [
        0,
        1
      ],
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        3,
        0
      ]
    ],
    "id": 6,
    "title": "Old Roots",
    "region": 1,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "An old bell hangs between the roots. The wall must remember it, too.",
    "hints": [
      "The old bell still needs a visit.",
      "Combine the bell rule with the wall rule. You may separate matching shapes into different areas.",
      "From the round start: right, up, left, up, up, right, down, right, right, up."
    ]
  },
  {
    "size": 2,
    "waypoints": [],
    "symbols": [],
    "triangles": [
      {
        "cell": [
          0,
          1
        ],
        "count": 1
      }
    ],
    "solution": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        0
      ]
    ],
    "id": 7,
    "title": "One Reed",
    "region": 2,
    "start": [
      0,
      2
    ],
    "end": [
      2,
      0
    ],
    "note": "The reed keeper scratched a single triangle into the basin. Its edges tell a story.",
    "hints": [
      "Look at the sides of the marked basin.",
      "One triangle means exactly one of this cell’s four edges belongs to the line.",
      "From the round start: right, right, up, up."
    ]
  },
  {
    "size": 3,
    "waypoints": [],
    "symbols": [],
    "triangles": [
      {
        "cell": [
          0,
          0
        ],
        "count": 2
      },
      {
        "cell": [
          1,
          1
        ],
        "count": 3
      }
    ],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        0,
        2
      ],
      [
        0,
        1
      ],
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 8,
    "title": "An Inward Turn",
    "region": 2,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "One basin holds two reeds. Another holds three. The channel takes a careful turn.",
    "hints": [
      "The groups of triangles describe different counts.",
      "Each cell needs exactly as many drawn sides as its triangles: two for the upper left, three for the center.",
      "From the round start: right, right, up, up, left, down, left, up, up, right, right, right."
    ]
  },
  {
    "size": 3,
    "waypoints": [],
    "symbols": [],
    "triangles": [
      {
        "cell": [
          0,
          2
        ],
        "count": 1
      },
      {
        "cell": [
          1,
          1
        ],
        "count": 2
      },
      {
        "cell": [
          2,
          0
        ],
        "count": 3
      }
    ],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        3,
        0
      ]
    ],
    "id": 9,
    "title": "Three Measures",
    "region": 2,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "Three measures of water. A different count for every basin.",
    "hints": [
      "Read each marked basin separately.",
      "The lower left needs one drawn side, the center two, and the upper right three. Counts include outside edges.",
      "From the round start: right, right, up, left, up, up, right, down, right, up."
    ]
  },
  {
    "size": 3,
    "waypoints": [
      [
        1,
        2
      ],
      [
        2,
        1
      ]
    ],
    "symbols": [],
    "triangles": [],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        3,
        0
      ]
    ],
    "id": 10,
    "title": "The Reflection Walk",
    "region": 3,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "The water remembers the positions of two pale lanterns along the garden walk.",
    "hints": [
      "Look at the two pale lanterns in the reflection garden.",
      "The visible garden clue marks grid points (1,2) and (2,1). Visit both, like brass bells.",
      "From the round start: right, up, right, up, right, up."
    ],
    "observation": "Garden clue: the two pale lanterns reflect onto grid points (1,2) and (2,1), counting columns from the left and rows from the top, starting at zero. Pass through both reflections."
  },
  {
    "size": 3,
    "waypoints": [],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "stone"
      }
    ],
    "triangles": [
      {
        "cell": [
          1,
          1
        ],
        "count": 1
      }
    ],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        3,
        1
      ],
      [
        2,
        1
      ],
      [
        1,
        1
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 11,
    "title": "Held Apart",
    "region": 3,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "The orchard wall reaches the reed basin. Two kinds of care become one.",
    "hints": [
      "The hedge and the reeds obey their familiar rules together.",
      "Separate leaf and stone regions, while giving the center cell exactly one drawn edge.",
      "From the round start: right, right, up, right, up, left, left, up, right, right."
    ]
  },
  {
    "size": 3,
    "waypoints": [
      [
        1,
        2
      ],
      [
        2,
        1
      ]
    ],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "stone"
      }
    ],
    "triangles": [
      {
        "cell": [
          0,
          0
        ],
        "count": 1
      },
      {
        "cell": [
          2,
          2
        ],
        "count": 1
      }
    ],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        3,
        0
      ]
    ],
    "id": 12,
    "title": "A Woven Memory",
    "region": 3,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "Bells, banks, and basins: the garden begins to remember its whole shape.",
    "hints": [
      "Every mark matters, but only by its own familiar rule.",
      "Visit both rings, separate leaf and stone areas, and draw exactly one side of each corner triangle cell.",
      "From the round start: right, right, up, left, up, up, right, down, right, up."
    ]
  },
  {
    "size": 3,
    "waypoints": [
      [
        1,
        2
      ],
      [
        2,
        1
      ]
    ],
    "symbols": [
      {
        "cell": [
          0,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          0
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          0
        ],
        "kind": "stone"
      },
      {
        "cell": [
          0,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          1,
          2
        ],
        "kind": "leaf"
      },
      {
        "cell": [
          2,
          2
        ],
        "kind": "leaf"
      }
    ],
    "triangles": [
      {
        "cell": [
          0,
          1
        ],
        "count": 1
      },
      {
        "cell": [
          1,
          1
        ],
        "count": 3
      },
      {
        "cell": [
          2,
          1
        ],
        "count": 1
      }
    ],
    "solution": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ],
      [
        3,
        2
      ],
      [
        2,
        2
      ],
      [
        1,
        2
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ]
    ],
    "id": 13,
    "title": "The Last Light",
    "region": 3,
    "start": [
      0,
      3
    ],
    "end": [
      3,
      0
    ],
    "note": "There was never a keeper hidden at the summit. There was only the work, waiting to be continued.",
    "hints": [
      "The final light asks for everything the garden taught you.",
      "Visit the two rings. Separate leaves and stones. Across the middle row, draw exactly one, three, and one cell sides.",
      "From the round start: right, right, right, up, left, left, up, right, up, right."
    ]
  }
];
