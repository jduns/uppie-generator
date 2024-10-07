// pages/api/generateStory.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { age, storyType, length, numPictures } = req.body;

        // Here you would integrate with your story generation backend (Kobold Lite, AI Horde, etc.)
        // This is a placeholder response, replace it with the actual story generation logic
        const mockStory = {
            title: "A Magical Adventure",
            content: `Once upon a time, in a land far, far away...\n\nThere was a brave young hero who embarked on an exciting adventure...`,
            pictures: [
                "https://example.com/picture1.jpg",
                "https://example.com/picture2.jpg",
            ]
        };

        // Send back the generated story
        res.status(200).json(mockStory);
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
