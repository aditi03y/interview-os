import type { RoadmapDay } from '../types'

export const SDE_ROADMAP_15_DAYS: RoadmapDay[] = [
  {
    day: 1,
    title: 'Arrays & Complexity',
    subtitle: 'Foundation of DSA — understand arrays and Big-O analysis',
    estimatedMinutes: 180,
    theory: [
      {
        id: 'd1-t1',
        title: 'Arrays — Memory Layout & Operations',
        description: 'Contiguous memory, indexing, insertion/deletion cost',
        resources: [
          { id: 'd1-t1-r1', title: 'GFG: Array Data Structure', url: 'https://www.geeksforgeeks.org/array-data-structure/', type: 'article' },
          { id: 'd1-t1-r2', title: 'NeetCode: Arrays & Hashing', url: 'https://neetcode.io/roadmap', type: 'docs' },
        ],
      },
      {
        id: 'd1-t2',
        title: 'Time & Space Complexity',
        description: 'Big-O, Big-Θ, Big-Ω — analyze algorithm efficiency',
        resources: [
          { id: 'd1-t2-r1', title: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/', type: 'docs' },
          { id: 'd1-t2-r2', title: 'Complexity Video', url: 'https://www.youtube.com/watch?v=Mo4vesautXg', type: 'video' },
        ],
      },
    ],
    dsa: [
      {
        id: 'd1-d1',
        title: 'Two Sum',
        resources: [{ id: 'd1-d1-r1', title: 'LeetCode #1', url: 'https://leetcode.com/problems/two-sum/', type: 'problem' }],
      },
      {
        id: 'd1-d2',
        title: 'Maximum Subarray (Kadane)',
        resources: [{ id: 'd1-d2-r1', title: 'LeetCode #53', url: 'https://leetcode.com/problems/maximum-subarray/', type: 'problem' }],
      },
      {
        id: 'd1-d3',
        title: 'Contains Duplicate',
        resources: [{ id: 'd1-d3-r1', title: 'LeetCode #217', url: 'https://leetcode.com/problems/contains-duplicate/', type: 'problem' }],
      },
    ],
    assignment: [
      {
        id: 'd1-a1',
        title: 'Implement Dynamic Array (Vector)',
        description: 'Build resize logic with amortized O(1) append',
        resources: [
          { id: 'd1-a1-r1', title: 'GFG: Dynamic Array', url: 'https://www.geeksforgeeks.org/dynamic-array-class-in-cpp/', type: 'article' },
        ],
      },
    ],
    promptTemplates: [
      {
        id: 'd1-p1',
        title: 'Explain Kadane\'s Algorithm',
        prompt: 'Explain Kadane\'s algorithm for maximum subarray. Walk through the intuition, pseudocode, and a dry run on [-2,1,-3,4,-1,2,1,-5,4].',
      },
      {
        id: 'd1-p2',
        title: 'Complexity Analysis Practice',
        prompt: 'Quiz me on Big-O complexity for array operations: access, insert at end, insert at beginning, delete, search. Give me 5 problems to analyze.',
      },
    ],
  },
  {
    day: 2,
    title: 'Hash Maps & Sets',
    subtitle: 'O(1) lookups — frequency counting and deduplication',
    estimatedMinutes: 180,
    theory: [
      {
        id: 'd2-t1',
        title: 'Hash Tables — Collisions & Load Factor',
        resources: [
          { id: 'd2-t1-r1', title: 'GFG: Hashing', url: 'https://www.geeksforgeeks.org/hashing-data-structure/', type: 'article' },
        ],
      },
      {
        id: 'd2-t2',
        title: 'Map vs Set Use Cases',
        description: 'When to use frequency maps, seen sets, and grouped buckets',
      },
    ],
    dsa: [
      { id: 'd2-d1', title: 'Valid Anagram', resources: [{ id: 'd2-d1-r1', title: 'LeetCode #242', url: lc('valid-anagram'), type: 'problem' }] },
      { id: 'd2-d2', title: 'Group Anagrams', resources: [{ id: 'd2-d2-r1', title: 'LeetCode #49', url: lc('group-anagrams'), type: 'problem' }] },
      { id: 'd2-d3', title: 'Top K Frequent Elements', resources: [{ id: 'd2-d3-r1', title: 'LeetCode #347', url: lc('top-k-frequent-elements'), type: 'problem' }] },
    ],
    assignment: [
      {
        id: 'd2-a1',
        title: 'Implement HashMap from Scratch',
        description: 'Chaining or open addressing with get/put/remove',
      },
    ],
    promptTemplates: [
      {
        id: 'd2-p1',
        title: 'Hash Map Pattern Review',
        prompt: 'What are the top 5 hash map patterns for SDE interviews? For each, give one LeetCode example and when to recognize the pattern.',
      },
    ],
  },
  {
    day: 3,
    title: 'Two Pointers',
    subtitle: 'Optimize array/string problems with left-right pointers',
    estimatedMinutes: 150,
    theory: [
      { id: 'd3-t1', title: 'Opposite Direction Pointers', description: 'Sorted arrays, palindrome checks' },
      { id: 'd3-t2', title: 'Same Direction (Fast & Slow)', description: 'In-place removal, linked list cycle' },
    ],
    dsa: [
      { id: 'd3-d1', title: 'Valid Palindrome', resources: [{ id: 'd3-d1-r1', title: 'LeetCode #125', url: lc('valid-palindrome'), type: 'problem' }] },
      { id: 'd3-d2', title: '3Sum', resources: [{ id: 'd3-d2-r1', title: 'LeetCode #15', url: lc('3sum'), type: 'problem' }] },
      { id: 'd3-d3', title: 'Container With Most Water', resources: [{ id: 'd3-d3-r1', title: 'LeetCode #11', url: lc('container-with-most-water'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd3-a1', title: 'Merge Two Sorted Arrays In-Place', description: 'Use two pointers from the end' },
    ],
    promptTemplates: [
      {
        id: 'd3-p1',
        title: 'Two Pointer Recognition',
        prompt: 'How do I know when to use two pointers vs sliding window? Give decision criteria and 3 example problems for each.',
      },
    ],
  },
  {
    day: 4,
    title: 'Sliding Window',
    subtitle: 'Subarray/substring problems with fixed and variable windows',
    estimatedMinutes: 150,
    theory: [
      { id: 'd4-t1', title: 'Fixed vs Variable Window', description: 'Window expansion and contraction' },
      { id: 'd4-t2', title: 'Window Invariants', description: 'Maintain counts, sums, or uniqueness constraints' },
    ],
    dsa: [
      { id: 'd4-d1', title: 'Best Time to Buy and Sell Stock', resources: [{ id: 'd4-d1-r1', title: 'LeetCode #121', url: lc('best-time-to-buy-and-sell-stock'), type: 'problem' }] },
      { id: 'd4-d2', title: 'Longest Substring Without Repeating Characters', resources: [{ id: 'd4-d2-r1', title: 'LeetCode #3', url: lc('longest-substring-without-repeating-characters'), type: 'problem' }] },
      { id: 'd4-d3', title: 'Minimum Window Substring', resources: [{ id: 'd4-d3-r1', title: 'LeetCode #76', url: lc('minimum-window-substring'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd4-a1', title: 'Max Sum Subarray of Size K', description: 'Classic fixed window warm-up' },
    ],
    promptTemplates: [
      {
        id: 'd4-p1',
        title: 'Sliding Window Template',
        prompt: 'Give me a reusable sliding window template in Python and Java for variable-size windows. Explain each line.',
      },
    ],
  },
  {
    day: 5,
    title: 'Stack & Queue',
    subtitle: 'LIFO/FIFO structures for parsing and BFS foundations',
    estimatedMinutes: 150,
    theory: [
      { id: 'd5-t1', title: 'Stack ADT & Monotonic Stack', resources: [{ id: 'd5-t1-r1', title: 'GFG: Stack', url: gfg('stack-data-structure'), type: 'article' }] },
      { id: 'd5-t2', title: 'Queue, Deque & Circular Queue' },
    ],
    dsa: [
      { id: 'd5-d1', title: 'Valid Parentheses', resources: [{ id: 'd5-d1-r1', title: 'LeetCode #20', url: lc('valid-parentheses'), type: 'problem' }] },
      { id: 'd5-d2', title: 'Min Stack', resources: [{ id: 'd5-d2-r1', title: 'LeetCode #155', url: lc('min-stack'), type: 'problem' }] },
      { id: 'd5-d3', title: 'Daily Temperatures', resources: [{ id: 'd5-d3-r1', title: 'LeetCode #739', url: lc('daily-temperatures'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd5-a1', title: 'Implement Stack using Queues', description: 'Amortized O(1) push/pop' },
    ],
    promptTemplates: [
      {
        id: 'd5-p1',
        title: 'Monotonic Stack',
        prompt: 'Explain monotonic stack with Daily Temperatures as example. When should I use increasing vs decreasing stack?',
      },
    ],
  },
  {
    day: 6,
    title: 'Binary Search',
    subtitle: 'Divide search space — arrays, answers, and rotated arrays',
    estimatedMinutes: 150,
    theory: [
      { id: 'd6-t1', title: 'Binary Search Template', description: 'lo/hi, mid, shrink left or right' },
      { id: 'd6-t2', title: 'Search on Answer Space', description: 'Minimize maximum, capacity problems' },
    ],
    dsa: [
      { id: 'd6-d1', title: 'Binary Search', resources: [{ id: 'd6-d1-r1', title: 'LeetCode #704', url: lc('binary-search'), type: 'problem' }] },
      { id: 'd6-d2', title: 'Search Insert Position', resources: [{ id: 'd6-d2-r1', title: 'LeetCode #35', url: lc('search-insert-position'), type: 'problem' }] },
      { id: 'd6-d3', title: 'Find Minimum in Rotated Sorted Array', resources: [{ id: 'd6-d3-r1', title: 'LeetCode #153', url: lc('find-minimum-in-rotated-sorted-array'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd6-a1', title: 'Implement Lower Bound / Upper Bound', description: 'STL-style binary search variants' },
    ],
    promptTemplates: [
      {
        id: 'd6-p1',
        title: 'BS on Answer',
        prompt: 'Explain binary search on answer with "Koko Eating Bananas" or "Capacity to Ship Packages". How to define the search space?',
      },
    ],
  },
  {
    day: 7,
    title: 'Linked Lists',
    subtitle: 'Pointer manipulation — reverse, merge, cycle detection',
    estimatedMinutes: 150,
    theory: [
      { id: 'd7-t1', title: 'Singly & Doubly Linked Lists', resources: [{ id: 'd7-t1-r1', title: 'GFG: Linked List', url: gfg('linked-list-data-structure'), type: 'article' }] },
      { id: 'd7-t2', title: 'Dummy Node Technique', description: 'Simplify edge cases at list head' },
    ],
    dsa: [
      { id: 'd7-d1', title: 'Reverse Linked List', resources: [{ id: 'd7-d1-r1', title: 'LeetCode #206', url: lc('reverse-linked-list'), type: 'problem' }] },
      { id: 'd7-d2', title: 'Merge Two Sorted Lists', resources: [{ id: 'd7-d2-r1', title: 'LeetCode #21', url: lc('merge-two-sorted-lists'), type: 'problem' }] },
      { id: 'd7-d3', title: 'Linked List Cycle', resources: [{ id: 'd7-d3-r1', title: 'LeetCode #141', url: lc('linked-list-cycle'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd7-a1', title: 'Implement LRU Cache (intro)', description: 'HashMap + Doubly Linked List skeleton' },
    ],
    promptTemplates: [
      {
        id: 'd7-p1',
        title: 'Fast & Slow Pointers',
        prompt: 'Explain Floyd\'s cycle detection on linked lists. Why does fast/slow pointer work? Prove or intuitively explain.',
      },
    ],
  },
  {
    day: 8,
    title: 'Trees — BFS & DFS',
    subtitle: 'Traversals, recursion, and level-order patterns',
    estimatedMinutes: 180,
    theory: [
      { id: 'd8-t1', title: 'Binary Tree Traversals', description: 'Preorder, inorder, postorder, level-order' },
      { id: 'd8-t2', title: 'Recursion vs Iteration (Stack/Queue)' },
    ],
    dsa: [
      { id: 'd8-d1', title: 'Maximum Depth of Binary Tree', resources: [{ id: 'd8-d1-r1', title: 'LeetCode #104', url: lc('maximum-depth-of-binary-tree'), type: 'problem' }] },
      { id: 'd8-d2', title: 'Binary Tree Level Order Traversal', resources: [{ id: 'd8-d2-r1', title: 'LeetCode #102', url: lc('binary-tree-level-order-traversal'), type: 'problem' }] },
      { id: 'd8-d3', title: 'Same Tree', resources: [{ id: 'd8-d3-r1', title: 'LeetCode #100', url: lc('same-tree'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd8-a1', title: 'Serialize & Deserialize Binary Tree', description: 'Design encoding scheme' },
    ],
    promptTemplates: [
      {
        id: 'd8-p1',
        title: 'Tree Recursion Template',
        prompt: 'Give me a universal DFS recursion template for binary trees and explain base case, left, right, and return value patterns.',
      },
    ],
  },
  {
    day: 9,
    title: 'Binary Search Trees',
    subtitle: 'BST property, validation, and order statistics',
    estimatedMinutes: 150,
    theory: [
      { id: 'd9-t1', title: 'BST Invariant & Inorder Property' },
      { id: 'd9-t2', title: 'Self-Balancing Trees (AVL, Red-Black) — Overview' },
    ],
    dsa: [
      { id: 'd9-d1', title: 'Validate Binary Search Tree', resources: [{ id: 'd9-d1-r1', title: 'LeetCode #98', url: lc('validate-binary-search-tree'), type: 'problem' }] },
      { id: 'd9-d2', title: 'Kth Smallest Element in a BST', resources: [{ id: 'd9-d2-r1', title: 'LeetCode #230', url: lc('kth-smallest-element-in-a-bst'), type: 'problem' }] },
      { id: 'd9-d3', title: 'Lowest Common Ancestor of a BST', resources: [{ id: 'd9-d3-r1', title: 'LeetCode #235', url: lc('lowest-common-ancestor-of-a-binary-search-tree'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd9-a1', title: 'Implement BST Insert & Search', description: 'Recursive and iterative versions' },
    ],
    promptTemplates: [
      {
        id: 'd9-p1',
        title: 'BST Interview Questions',
        prompt: 'What are common BST interview questions beyond basic CRUD? Cover successor/predecessor, range queries, and conversion problems.',
      },
    ],
  },
  {
    day: 10,
    title: 'Heaps & Priority Queues',
    subtitle: 'Top-K, merge patterns, and scheduling problems',
    estimatedMinutes: 150,
    theory: [
      { id: 'd10-t1', title: 'Min-Heap vs Max-Heap', resources: [{ id: 'd10-t1-r1', title: 'GFG: Heap', url: gfg('heap-data-structure'), type: 'article' }] },
      { id: 'd10-t2', title: 'Heapify & Time Complexity' },
    ],
    dsa: [
      { id: 'd10-d1', title: 'Kth Largest Element in an Array', resources: [{ id: 'd10-d1-r1', title: 'LeetCode #215', url: lc('kth-largest-element-in-an-array'), type: 'problem' }] },
      { id: 'd10-d2', title: 'Merge K Sorted Lists', resources: [{ id: 'd10-d2-r1', title: 'LeetCode #23', url: lc('merge-k-sorted-lists'), type: 'problem' }] },
      { id: 'd10-d3', title: 'Find Median from Data Stream', resources: [{ id: 'd10-d3-r1', title: 'LeetCode #295', url: lc('find-median-from-data-stream'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd10-a1', title: 'Implement Min-Heap from Scratch', description: 'Insert, extractMin, heapify' },
    ],
    promptTemplates: [
      {
        id: 'd10-p1',
        title: 'Top K Pattern',
        prompt: 'Explain the Top-K pattern using heaps. Compare heap vs quickselect vs sorting. When to use each?',
      },
    ],
  },
  {
    day: 11,
    title: 'Backtracking',
    subtitle: 'Explore decision trees — subsets, permutations, combinations',
    estimatedMinutes: 180,
    theory: [
      { id: 'd11-t1', title: 'Backtracking Template', description: 'Choose, explore, unchoose' },
      { id: 'd11-t2', title: 'Pruning & Constraint Propagation' },
    ],
    dsa: [
      { id: 'd11-d1', title: 'Subsets', resources: [{ id: 'd11-d1-r1', title: 'LeetCode #78', url: lc('subsets'), type: 'problem' }] },
      { id: 'd11-d2', title: 'Combination Sum', resources: [{ id: 'd11-d2-r1', title: 'LeetCode #39', url: lc('combination-sum'), type: 'problem' }] },
      { id: 'd11-d3', title: 'Permutations', resources: [{ id: 'd11-d3-r1', title: 'LeetCode #46', url: lc('permutations'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd11-a1', title: 'N-Queens (1 solution)', description: 'Classic backtracking with board representation' },
    ],
    promptTemplates: [
      {
        id: 'd11-p1',
        title: 'Backtracking vs DFS',
        prompt: 'What is the difference between backtracking and DFS on graphs? When is backtracking the right mental model?',
      },
    ],
  },
  {
    day: 12,
    title: 'Graphs — BFS & DFS',
    subtitle: 'Adjacency representations, connected components, topo sort',
    estimatedMinutes: 180,
    theory: [
      { id: 'd12-t1', title: 'Graph Representations', description: 'Adjacency list, matrix, edge list' },
      { id: 'd12-t2', title: 'BFS vs DFS — When to Use Each' },
    ],
    dsa: [
      { id: 'd12-d1', title: 'Number of Islands', resources: [{ id: 'd12-d1-r1', title: 'LeetCode #200', url: lc('number-of-islands'), type: 'problem' }] },
      { id: 'd12-d2', title: 'Clone Graph', resources: [{ id: 'd12-d2-r1', title: 'LeetCode #133', url: lc('clone-graph'), type: 'problem' }] },
      { id: 'd12-d3', title: 'Course Schedule', resources: [{ id: 'd12-d3-r1', title: 'LeetCode #207', url: lc('course-schedule'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd12-a1', title: 'Build Graph from Edge List + BFS/DFS', description: 'Generic graph class with traversals' },
    ],
    promptTemplates: [
      {
        id: 'd12-p1',
        title: 'Graph Pattern Guide',
        prompt: 'List the top 6 graph patterns for SDE interviews: islands, shortest path, topo sort, union-find, etc. With recognition signals.',
      },
    ],
  },
  {
    day: 13,
    title: 'Dynamic Programming I',
    subtitle: '1D DP — overlapping subproblems and optimal substructure',
    estimatedMinutes: 180,
    theory: [
      { id: 'd13-t1', title: 'DP Framework', description: 'State definition, transition, base cases' },
      { id: 'd13-t2', title: 'Memoization vs Tabulation' },
    ],
    dsa: [
      { id: 'd13-d1', title: 'Climbing Stairs', resources: [{ id: 'd13-d1-r1', title: 'LeetCode #70', url: lc('climbing-stairs'), type: 'problem' }] },
      { id: 'd13-d2', title: 'House Robber', resources: [{ id: 'd13-d2-r1', title: 'LeetCode #198', url: lc('house-robber'), type: 'problem' }] },
      { id: 'd13-d3', title: 'Coin Change', resources: [{ id: 'd13-d3-r1', title: 'LeetCode #322', url: lc('coin-change'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd13-a1', title: 'Fibonacci — Memo vs Tab vs Optimized', description: 'Compare all three approaches' },
    ],
    promptTemplates: [
      {
        id: 'd13-p1',
        title: 'DP Recognition',
        prompt: 'How do I recognize a DP problem in an interview? Give me a checklist and 5 "almost DP" problems with explanations.',
      },
    ],
  },
  {
    day: 14,
    title: 'Dynamic Programming II',
    subtitle: '2D DP — grids, strings, and sequence alignment',
    estimatedMinutes: 180,
    theory: [
      { id: 'd14-t1', title: '2D State Transitions', description: 'Grid paths, LCS, edit distance' },
      { id: 'd14-t2', title: 'Space Optimization Techniques' },
    ],
    dsa: [
      { id: 'd14-d1', title: 'Unique Paths', resources: [{ id: 'd14-d1-r1', title: 'LeetCode #62', url: lc('unique-paths'), type: 'problem' }] },
      { id: 'd14-d2', title: 'Longest Common Subsequence', resources: [{ id: 'd14-d2-r1', title: 'LeetCode #1143', url: lc('longest-common-subsequence'), type: 'problem' }] },
      { id: 'd14-d3', title: 'Edit Distance', resources: [{ id: 'd14-d3-r1', title: 'LeetCode #72', url: lc('edit-distance'), type: 'problem' }] },
    ],
    assignment: [
      { id: 'd14-a1', title: 'Knapsack 0/1', description: 'Classic 2D DP with space optimization' },
    ],
    promptTemplates: [
      {
        id: 'd14-p1',
        title: 'String DP',
        prompt: 'Explain the DP pattern for string matching problems (LCS, edit distance, palindrome partitioning). How to define dp[i][j]?',
      },
    ],
  },
  {
    day: 15,
    title: 'Review & Mock Interview',
    subtitle: 'Consolidate patterns, timed practice, and system design intro',
    estimatedMinutes: 240,
    theory: [
      { id: 'd15-t1', title: 'Pattern Cheat Sheet Review', description: 'Revisit all 14 days — weak areas first' },
      { id: 'd15-t2', title: 'System Design Basics', resources: [{ id: 'd15-t2-r1', title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'docs' }] },
    ],
    dsa: [
      { id: 'd15-d1', title: 'Timed Mock: 2 Medium Problems', description: '45 min — pick from weak patterns' },
      { id: 'd15-d2', title: 'Timed Mock: 1 Hard Problem', description: '35 min — graph or DP' },
      { id: 'd15-d3', title: 'Review Missed Problems', description: 'Re-solve without hints' },
    ],
    assignment: [
      { id: 'd15-a1', title: 'Build Interview Readiness Report', description: 'Document strengths, weak patterns, and 2-week plan' },
    ],
    promptTemplates: [
      {
        id: 'd15-p1',
        title: 'Mock Interview',
        prompt: 'Conduct a 45-minute SDE mock interview. Give me one medium array/hash problem with hints only if I ask. Evaluate my approach, code, and complexity analysis.',
      },
      {
        id: 'd15-p2',
        title: 'Final Review',
        prompt: 'Based on a 15-day SDE roadmap covering arrays through DP, create a personalized final review checklist. What should I prioritize 3 days before an interview?',
      },
    ],
  },
]

function lc(slug: string) {
  return `https://leetcode.com/problems/${slug}/`
}

function gfg(path: string) {
  return `https://www.geeksforgeeks.org/${path}/`
}
