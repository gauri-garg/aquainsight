# AquaInsight 🌊

AquaInsight is a modern, AI-powered web platform for submitting, managing, and analyzing marine environmental datasets. It's designed to streamline the data review process for organizations like CMLRE and provide researchers and students with access to valuable data.

![AquaInsight Dashboard](https://picsum.photos/seed/ocean-dashboard/1200/630)

## ✨ Key Features

*   **Role-Based Access Control:** Tailored experiences for different user roles (CMLRE Staff, User).
*   **Dataset Submission:** Simple and intuitive interface for uploading CSV datasets.
*   **AI-Powered Summarization:** Leverages Google's Genkit to automatically generate summaries of submitted datasets, aiding in the review process.
*   **eDNA Matching Assistant:** An AI flow to match eDNA sequences against a database of known species.
*   **Interactive Dashboard:** Visualizes key metrics, recent datasets, species distribution, and ocean parameter trends.
*   **Modern UI/UX:** Built with Next.js, Tailwind CSS, and shadcn/ui for a responsive and beautiful user experience.
*   **Secure Authentication:** Uses Firebase Authentication for user management and sign-in.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **AI/ML:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **Database & Auth:** [Firebase](https://firebase.google.com/) (Authentication & Realtime Database)
*   **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
*   **Data Visualization:** [Recharts](https://recharts.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.18.0 or later)
*   npm or a compatible package manager
*   A Firebase project with Authentication and Realtime Database enabled.
*   A Google AI API key for Genkit flows.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aquainsight.git
    cd aquainsight
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add your Firebase and Google AI credentials. You can use the example below as a template.

    ```sh
    # .env.local.example

    # Firebase Configuration
    # Get these from your Firebase project settings
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=

    # Google AI (for Genkit)
    GOOGLE_API_KEY=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open http://localhost:3000 with your browser to see the result.

## 📂 Project Structure

The project follows the standard Next.js App Router structure. Here are some key directories:

```
src
├── ai/
│   └── flows/        # Genkit AI flows (e.g., summarization, eDNA matching)
├── api-examples/
│   └── copernicus_marine_client.py # Example Python client for Copernicus
├── app/
│   ├── (auth)/       # Authentication pages (login, register)
│   └── dashboard/    # Main application dashboard and protected routes
├── components/
│   └── ui/           # Reusable UI components from shadcn/ui
├── hooks/
│   └── use-auth.tsx  # Custom hook for Firebase authentication
├── lib/
│   ├── firebase.ts   # Firebase initialization
│   └── utils.ts      # Utility functions (e.g., cn for Tailwind)
└── ...
```

## 🤖 AI Integration (Genkit)

This project uses **Genkit** to power its AI features. The core AI logic is defined as "flows" located in `src/ai/flows/`.

*   **`generate-dataset-summary.ts`**: This flow takes a dataset description and a data sample, then uses a generative model to produce a concise summary. This helps reviewers quickly understand the context and quality of a new submission.
*   **`edna-matching-assistant.ts`**: This flow is designed to take an eDNA sequence and match it against a species database, providing a list of potential species and confidence scores.

These flows are called from the frontend as server actions, ensuring that API keys and complex logic remain on the server.

## 🌐 External API Integration (Copernicus Example)

The `api-examples/` directory contains a sample Python script (`copernicus_marine_client.py`) for fetching real-time data from the **Copernicus Marine Service**.

### Important Notes:

*   **This is an example script and is NOT currently integrated into the Next.js application.**
*   The Next.js environment in this project does not run Python code directly.
*   To use this script, you would need to deploy it as a separate backend service (e.g., a Google Cloud Function, Cloud Run service, or on another serverless platform) and call it from a Next.js API route.

### How to Use the Copernicus Example

1.  **Set Up a Python Environment:** Create a Python virtual environment and install the required packages:
    ```bash
    python -m venv venv
    source venv/bin/activate
    pip install -r api-examples/requirements.txt
    ```

2.  **Get Copernicus Credentials:** You must register on the [Copernicus Marine Service website](https://marine.copernicus.eu/) and store your username and password as environment variables.

3.  **Run the Script:** You can test the script from your command line. See the comments within the file for usage instructions.

4.  **Deploy as a Service:** To integrate with your Next.js app, you should wrap this script in a web framework (like Flask or FastAPI) and deploy it. Your Next.js app would then make requests to your deployed service.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improving AquaInsight, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
