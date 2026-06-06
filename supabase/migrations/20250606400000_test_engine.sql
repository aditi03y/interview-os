-- Test Engine: definitions, questions, attempts, leaderboard-ready indexes

-- ---------------------------------------------------------------------------
-- test_definitions — catalog of test templates
-- ---------------------------------------------------------------------------
create table public.test_definitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  test_type text not null
    check (test_type in ('mcq', 'subjective', 'coding', 'mixed')),
  schedule_type text not null default 'manual'
    check (schedule_type in ('revision_2d', 'cumulative_5d', 'manual')),
  duration_minutes integer not null default 30
    check (duration_minutes > 0),
  difficulty text
    check (difficulty is null or difficulty in ('Easy', 'Medium', 'Hard')),
  topics jsonb not null default '[]'::jsonb,
  max_score numeric(7, 2) not null default 100
    check (max_score > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint test_definitions_title_not_empty check (char_length(trim(title)) > 0)
);

create index test_definitions_schedule_type_idx on public.test_definitions (schedule_type)
  where is_active = true;

create trigger test_definitions_set_updated_at
  before update on public.test_definitions
  for each row execute function public.set_updated_at();

alter table public.test_definitions enable row level security;

create policy "test_definitions_select_authenticated"
  on public.test_definitions for select
  to authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- test_questions — question bank per definition
-- ---------------------------------------------------------------------------
create table public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_definition_id uuid not null references public.test_definitions (id) on delete cascade,
  question_type text not null
    check (question_type in ('mcq', 'subjective', 'coding')),
  title text not null,
  body text not null default '',
  options jsonb,
  correct_answer text,
  rubric text,
  starter_code text,
  metadata jsonb not null default '{}'::jsonb,
  points numeric(5, 2) not null default 1
    check (points > 0),
  order_index integer not null default 0,
  study_day integer
    check (study_day is null or (study_day >= 1 and study_day <= 30)),
  topic text,
  created_at timestamptz not null default now(),
  constraint test_questions_title_not_empty check (char_length(trim(title)) > 0)
);

create index test_questions_definition_idx on public.test_questions (test_definition_id, order_index);
create index test_questions_study_day_idx on public.test_questions (study_day)
  where study_day is not null;

alter table public.test_questions enable row level security;

create policy "test_questions_select_authenticated"
  on public.test_questions for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- test_attempts — user attempts with answers and scoring
-- ---------------------------------------------------------------------------
create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  test_definition_id uuid not null references public.test_definitions (id) on delete restrict,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'auto_submitted', 'abandoned')),
  score numeric(7, 2),
  max_score numeric(7, 2) not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  time_spent_seconds integer
    check (time_spent_seconds is null or time_spent_seconds >= 0),
  expires_at timestamptz not null,
  answers jsonb not null default '{}'::jsonb,
  selected_question_ids uuid[] not null default '{}',
  auto_submitted boolean not null default false,
  schedule_day integer
    check (schedule_day is null or schedule_day >= 1),
  covered_study_days integer[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint test_attempts_score_range check (
    score is null or (score >= 0 and score <= max_score)
  )
);

create index test_attempts_user_id_idx on public.test_attempts (user_id, created_at desc);
create index test_attempts_status_idx on public.test_attempts (user_id, status);
-- Leaderboard-ready: rank by score desc, then faster completion
create index test_attempts_leaderboard_idx on public.test_attempts (
  test_definition_id,
  score desc,
  time_spent_seconds asc
) where status in ('completed', 'auto_submitted') and score is not null;

create trigger test_attempts_set_updated_at
  before update on public.test_attempts
  for each row execute function public.set_updated_at();

alter table public.test_attempts enable row level security;

create policy "test_attempts_select_own"
  on public.test_attempts for select
  using (auth.uid() = user_id);

create policy "test_attempts_select_leaderboard"
  on public.test_attempts for select
  using (status in ('completed', 'auto_submitted') and score is not null);

create policy "test_attempts_insert_own"
  on public.test_attempts for insert
  with check (auth.uid() = user_id);

create policy "test_attempts_update_own"
  on public.test_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "test_attempts_delete_own"
  on public.test_attempts for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed test definitions
-- ---------------------------------------------------------------------------
insert into public.test_definitions (id, title, description, test_type, schedule_type, duration_minutes, difficulty, topics, max_score)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    '2-Day Revision Quiz',
    'Mixed MCQ covering the previous two study plan days.',
    'mixed',
    'revision_2d',
    25,
    'Medium',
    '["revision", "mcq"]'::jsonb,
    50
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    '5-Day Cumulative Assessment',
    'Full cumulative test: MCQ, subjective, and coding from all covered days.',
    'mixed',
    'cumulative_5d',
    60,
    'Hard',
    '["cumulative", "mixed"]'::jsonb,
    100
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'DSA MCQ Practice',
    'Quick multiple-choice drill on core DSA topics.',
    'mcq',
    'manual',
    20,
    'Easy',
    '["mcq", "dsa"]'::jsonb,
    30
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'Concept Explanation — Subjective',
    'Explain algorithms and trade-offs in your own words.',
    'subjective',
    'manual',
    30,
    'Medium',
    '["subjective"]'::jsonb,
    40
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Coding Challenge Sprint',
    'Implement solutions with automated test-case validation.',
    'coding',
    'manual',
    45,
    'Hard',
    '["coding"]'::jsonb,
    50
  );

-- Seed questions for revision (mixed MCQ, days 1-4)
insert into public.test_questions (test_definition_id, question_type, title, body, options, correct_answer, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Two Sum Time Complexity',
    'What is the average time complexity of Two Sum using a hash map?',
    '[{"id":"a","label":"O(1)"},{"id":"b","label":"O(n)","isCorrect":true},{"id":"c","label":"O(n log n)"},{"id":"d","label":"O(n²)"}]'::jsonb,
    'b',
    5, 1, 1, 'Arrays'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Kadane''s Algorithm',
    'Kadane''s algorithm solves which problem optimally?',
    '[{"id":"a","label":"Longest increasing subsequence"},{"id":"b","label":"Maximum subarray sum","isCorrect":true},{"id":"c","label":"Shortest path"},{"id":"d","label":"Matrix chain multiplication"}]'::jsonb,
    'b',
    5, 2, 1, 'Arrays'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Hash Map Average Lookup',
    'Average-case lookup in a well-distributed hash map is:',
    '[{"id":"a","label":"O(1)","isCorrect":true},{"id":"b","label":"O(log n)"},{"id":"c","label":"O(n)"},{"id":"d","label":"O(n²)"}]'::jsonb,
    'a',
    5, 3, 2, 'Hash Maps'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Collision Resolution',
    'Which technique handles hash collisions by storing multiple values at the same bucket?',
    '[{"id":"a","label":"Open addressing"},{"id":"b","label":"Chaining","isCorrect":true},{"id":"c","label":"Binary search"},{"id":"d","label":"Merge sort"}]'::jsonb,
    'b',
    5, 4, 2, 'Hash Maps'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Stack Operations',
    'Which operation is NOT O(1) for a dynamic array-backed stack?',
    '[{"id":"a","label":"push"},{"id":"b","label":"pop"},{"id":"c","label":"peek"},{"id":"d","label":"search by value","isCorrect":true}]'::jsonb,
    'd',
    5, 5, 3, 'Stacks'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Valid Parentheses',
    'Valid Parentheses is best solved using:',
    '[{"id":"a","label":"Queue"},{"id":"b","label":"Stack","isCorrect":true},{"id":"c","label":"Heap"},{"id":"d","label":"Trie"}]'::jsonb,
    'b',
    5, 6, 3, 'Stacks'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Queue FIFO',
    'A queue processes elements in which order?',
    '[{"id":"a","label":"LIFO"},{"id":"b","label":"FIFO","isCorrect":true},{"id":"c","label":"Random"},{"id":"d","label":"Priority only"}]'::jsonb,
    'b',
    5, 7, 4, 'Queues'
  ),
  (
    'a1000000-0000-4000-8000-000000000001',
    'mcq',
    'Sliding Window Max',
    'Sliding Window Maximum typically uses a:',
    '[{"id":"a","label":"Monotonic deque","isCorrect":true},{"id":"b","label":"Binary heap only"},{"id":"c","label":"Union-Find"},{"id":"d","label":"Segment tree only"}]'::jsonb,
    'a',
    5, 8, 4, 'Queues'
  );

-- Cumulative questions (days 1-5, mixed types)
insert into public.test_questions (test_definition_id, question_type, title, body, options, correct_answer, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000002',
    'mcq',
    'Binary Search Precondition',
    'Binary search requires the input array to be:',
    '[{"id":"a","label":"Sorted","isCorrect":true},{"id":"b","label":"Unique only"},{"id":"c","label":"Even length"},{"id":"d","label":"Positive integers"}]'::jsonb,
    'a',
    10, 1, 5, 'Binary Search'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'mcq',
    'Merge Sort Complexity',
    'Time complexity of merge sort is:',
    '[{"id":"a","label":"O(n)"},{"id":"b","label":"O(n log n)","isCorrect":true},{"id":"c","label":"O(n²)"},{"id":"d","label":"O(log n)"}]'::jsonb,
    'b',
    10, 2, 1, 'Sorting'
  );

insert into public.test_questions (test_definition_id, question_type, title, body, rubric, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000002',
    'subjective',
    'Explain Two Pointers',
    'Explain the two-pointer technique with an example problem. When is it preferable to a hash map?',
    'Cover: sorted array precondition, O(n) scan, space savings vs hash map, example walkthrough.',
    20, 3, 2, 'Two Pointers'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'subjective',
    'Stack vs Queue Trade-offs',
    'Compare stacks and queues. Give one real interview problem for each and justify your choice of data structure.',
    'Mention LIFO vs FIFO, BFS/DFS connections, valid parentheses / level-order traversal examples.',
    20, 4, 3, 'Stacks & Queues'
  );

insert into public.test_questions (test_definition_id, question_type, title, body, starter_code, metadata, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000002',
    'coding',
    'Two Sum Implementation',
    'Implement twoSum(nums, target) that returns indices of two numbers adding to target. Assume exactly one solution.',
    'function twoSum(nums, target) {\n  // your code\n}',
    '{"testCases":[{"input":{"nums":[2,7,11,15],"target":9},"expected":[0,1]},{"input":{"nums":[3,2,4],"target":6},"expected":[1,2]}],"functionName":"twoSum"}'::jsonb,
    20, 5, 1, 'Arrays'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'coding',
    'Valid Parentheses',
    'Given a string s containing ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
    'function isValid(s) {\n  // your code\n}',
    '{"testCases":[{"input":{"s":"()"},"expected":true},{"input":{"s":"()[]{}"},"expected":true},{"input":{"s":"(]"},"expected":false}],"functionName":"isValid"}'::jsonb,
    20, 6, 3, 'Stacks'
  );

-- Manual MCQ practice
insert into public.test_questions (test_definition_id, question_type, title, body, options, correct_answer, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000003',
    'mcq',
    'Graph BFS Space',
    'BFS on a graph uses which auxiliary structure?',
    '[{"id":"a","label":"Stack"},{"id":"b","label":"Queue","isCorrect":true},{"id":"c","label":"Priority queue only"},{"id":"d","label":"Trie"}]'::jsonb,
    'b',
    10, 1, null, 'Graphs'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'mcq',
    'DP Overlapping Subproblems',
    'Dynamic programming is applicable when a problem has:',
    '[{"id":"a","label":"Overlapping subproblems and optimal substructure","isCorrect":true},{"id":"b","label":"Only greedy choice property"},{"id":"c","label":"No recursion"},{"id":"d","label":"Sorted input only"}]'::jsonb,
    'a',
    10, 2, null, 'Dynamic Programming'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'mcq',
    'Trie Use Case',
    'A trie is especially useful for:',
    '[{"id":"a","label":"Prefix / autocomplete queries","isCorrect":true},{"id":"b","label":"Shortest path"},{"id":"c","label":"Sorting integers"},{"id":"d","label":"Matrix multiplication"}]'::jsonb,
    'a',
    10, 3, null, 'Tries'
  );

-- Manual subjective
insert into public.test_questions (test_definition_id, question_type, title, body, rubric, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000004',
    'subjective',
    'Explain Binary Search',
    'Walk through binary search on a sorted array. What is the loop invariant?',
    'Include mid calculation, termination condition, O(log n) justification.',
    20, 1, null, 'Binary Search'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'subjective',
    'DP vs Greedy',
    'When would you choose dynamic programming over a greedy approach? Give a concrete example.',
    'Mention counterexamples to greedy, overlapping subproblems, knapsack or coin change.',
    20, 2, null, 'Dynamic Programming'
  );

-- Manual coding
insert into public.test_questions (test_definition_id, question_type, title, body, starter_code, metadata, points, order_index, study_day, topic)
values
  (
    'a1000000-0000-4000-8000-000000000005',
    'coding',
    'Reverse Linked List',
    'Reverse a singly linked list iteratively. Input is the head node {val, next}.',
    'function reverseList(head) {\n  // head: { val: number, next: Node | null }\n}',
    '{"testCases":[{"input":{"head":{"val":1,"next":{"val":2,"next":{"val":3,"next":null}}}},"expected":{"val":3,"next":{"val":2,"next":{"val":1,"next":null}}}},{"input":{"head":null},"expected":null}],"functionName":"reverseList"}'::jsonb,
    25, 1, null, 'Linked Lists'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'coding',
    'Max Depth of Binary Tree',
    'Return the maximum depth of a binary tree given its root.',
    'function maxDepth(root) {\n  // root: { val, left, right } | null\n}',
    '{"testCases":[{"input":{"root":{"val":3,"left":{"val":9,"left":null,"right":null},"right":{"val":20,"left":{"val":15,"left":null,"right":null},"right":{"val":7,"left":null,"right":null}}}},"expected":3},{"input":{"root":null},"expected":0}],"functionName":"maxDepth"}'::jsonb,
    25, 2, null, 'Trees'
  );
