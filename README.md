## Inspiration
Around 30-50% of neurodivergent individuals, including those with ADHD, autism, or other conditions, report difficulties with tasks and planning subtasks. These challenges often stem from issues like executive function deficits, which affect the ability to organize, prioritize, and break tasks down into manageable parts. We wanted to create a tool that simplifies this process, providing structured guidance and reducing the overwhelm that often comes with tackling complex projects.

## What it does
ToGrow is a chrome extension that helps users break down tasks into smaller, more actionable steps. Users enter a task, and the extension, powered by the Gemini API, suggests logical sub-tasks based on the input. This ensures a step-by-step approach to productivity, making overwhelming tasks feel more achievable.

## How we built it
- **Frontend:** We started with a **Figma** prototype, then used **HTML**, **CSS** and **JavaScript** to design a clean and intuitive user interface.
- **Backend:** We used **JavaScript** to handle task logic and integrated the **Gemini API** using **Flask for Python** to generate suggested sub-tasks dynamically.

## Challenges we ran into
- Designing a system that was simple yet effective without overwhelming users took several iterations and Figma frames. 
- Learning how to integrate Gemini API for the first time.
- Using CORS on different operating systems like macOS and Windows.

## Accomplishments that we're proud of
- Successfully integrating AI-powered task breakdowns into a Chrome extension.
- Creating an intuitive and visually appealing interface, including the use of **hand drawn** plant animations.
- Designing a tool that has real-world applications for neurodivergent users.
- Integrating chrome storage synch to reduce the need for backend database storage.

## What we learned
- Creating a effective UX/UI for such a small frame.
- The importance of considering the struggles of all individuals when creating a tool aimed to improve daily lives and tasks. 
- Best practices for building and structuring Chrome extensions.
- How to effectively work with the Gemini API for task generation.

## What's next for ToGrow
- **Customization:** Allowing users to personalize task breakdowns based on their preferences.
- **Task Tracking:** Adding progress tracking features to help users stay motivated.
- **Community Feedback:** Engaging with neurodivergent communities to refine and improve features based on real user experiences.
