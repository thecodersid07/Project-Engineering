# Fix Report

## Add Task page reload
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 34-35
- Root cause: The submit handler did not prevent the browser's default form submission.
- Fix applied: Added `e.preventDefault()` at the start of `handleAddTask`.
- Why it works: React handles the submit in place, so the page does not reload and local state is preserved.

## Unreliable task update after adding
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 49-56
- Root cause: The old code pushed into the existing `tasks` array and reused the same reference, so React could skip rendering the new item.
- Fix applied: Checked the API response, then updated state immutably with `setTasks(currentTasks => [data, ...currentTasks])` and cleared the input.
- Why it works: A new array reference tells React that state changed, so the task list reliably re-renders.

## Delete button failure/crash
- File name: `frontend/src/components/TaskItem.jsx`
- Line number: 16
- Root cause: The delete button passed the click event object instead of the task id.
- Fix applied: Changed the click handler to call `onDelete(task._id)`.
- Why it works: The delete handler now receives the id expected by the API route.

## Delete API response mismatch
- File name: `backend/controllers/taskController.js`
- Line number: 115-117
- Root cause: The server returned HTTP 204 with a JSON body, which is an invalid response shape for clients that expect JSON.
- Fix applied: Changed successful deletes to return HTTP 200 with a JSON confirmation body.
- Why it works: The client can treat successful deletes consistently without hitting empty-body parsing issues.

## Inconsistent mark completed
- File name: `frontend/src/components/TaskItem.jsx`
- Line number: 12
- Root cause: The button returned the `onToggleStatus` function instead of executing it.
- Fix applied: Changed the handler to call `onToggleStatus(task)`.
- Why it works: Clicking the button now invokes the parent update flow with the selected task.

## Persisting completed status
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 68-86
- Root cause: The task page did not implement a real status toggle request, and the backend update route changed memory only.
- Fix applied: Added `handleToggleStatus` to send the next status to the API and update the matching task in state from the response.
- Why it works: The UI and database now receive the same saved task state.

## Backend update not saving
- File name: `backend/controllers/taskController.js`
- Line number: 71-92
- Root cause: The controller changed the Mongoose document but never saved it.
- Fix applied: Validated id/status/title, assigned allowed fields, awaited `task.save()`, and returned the saved document.
- Why it works: The update is persisted before the API reports success.

## Dashboard stats crash/freeze
- File name: `frontend/src/components/TaskStats.jsx`
- Line number: 7-40
- Root cause: The stats effect had no dependency array, causing repeated fetches and render loops.
- Fix applied: Added a dependency array, loading reset, and an unmount guard.
- Why it works: Stats load once per `refreshTrigger` change instead of on every render.

## "0" showing instead of empty state
- File name: `frontend/src/components/TaskList.jsx`
- Line number: 8-21
- Root cause: `tasks.length && (...)` rendered the number `0` when the list was empty.
- Fix applied: Replaced the conditional with an explicit ternary.
- Why it works: Empty lists now render the friendly empty state instead of the numeric value.

## Auto-save logging showing 0 tasks
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 16-18, 113-119
- Root cause: The interval closed over the initial empty `tasks` array.
- Fix applied: Added `tasksRef`, synchronized it when `tasks` changes, and logged from the ref in the interval.
- Why it works: The interval remains stable while reading the latest task count.

## Duplicate tasks on rapid submission
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 37-43, 135-137
- Root cause: Rapid clicks could send multiple POST requests before the first one finished.
- Fix applied: Added an immediate `addInFlightRef` guard, kept `isAdding` for the disabled button state, and disabled the submit button while a task is being created.
- Why it works: The ref blocks repeat submits immediately, and the disabled button prevents further clicks during the in-flight save.

## Duplicate task protection on the server
- File name: `backend/models/Task.js`
- Line number: 4-9
- Root cause: The schema allowed duplicate task titles.
- Fix applied: Trimmed titles and added a unique constraint.
- Why it works: MongoDB rejects racing duplicate inserts even if multiple requests reach the server.

## API returning success even on failure
- File name: `backend/controllers/taskController.js`
- Line number: 42-63
- Root cause: `createTask` did not validate input, did not await `save()`, and returned HTTP 200 from the catch block.
- Fix applied: Validated title, awaited `task.save()`, returned HTTP 201 on success, HTTP 400/409 for client errors, and HTTP 500 for server errors.
- Why it works: The API only reports success after persistence completes, and failures use failure status codes.

## Frontend API error handling
- File name: `frontend/src/pages/TasksNotesPage.jsx`
- Line number: 22-30, 49-64, 77-89, 102-109
- Root cause: Failed requests were mostly logged to the console, leaving the UI action status stale.
- Fix applied: Checked `res.ok`, threw meaningful errors, and updated `lastAction` when load/add/update/delete operations fail.
- Why it works: The UI no longer silently reports the previous successful action after an API failure.

## Excessive/unrelated API data
- File name: `backend/controllers/taskController.js`
- Line number: 20-29
- Root cause: `getTasks` fetched notes for every task and returned full nested note histories.
- Fix applied: Removed the notes query, selected only task fields needed by the UI, sorted by creation date, and used `lean()`.
- Why it works: The task endpoint now returns the task list only, avoiding unrelated payload and N+1 queries.

## Empty task list API handling
- File name: `backend/controllers/taskController.js`
- Line number: 25-29
- Root cause: The API returned 404 when no tasks existed.
- Fix applied: Always returns HTTP 200 with `tasks: []` and `count: 0`.
- Why it works: An empty list is a valid result, so the frontend can render the empty state normally.

## Slow task list performance
- File name: `frontend/src/components/TaskList.jsx`
- Line number: 3-21
- Root cause: The component ran an expensive synchronous loop on every render.
- Fix applied: Removed the artificial heavy calculation.
- Why it works: Task list renders now do only the work needed to display tasks.

## Slow dashboard performance
- File name: `backend/models/Task.js`
- Line number: 14-24
- Root cause: Task queries had no useful status or sorting indexes.
- Fix applied: Added a status index and a `createdAt` index.
- Why it works: Common filtering and sorting paths can use database indexes instead of scanning more data.
