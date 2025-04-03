import { auth } from '../../auth'; // Import auth function
import { redirect } from 'next/navigation'; // Import redirect function

export default async function Page() {
    // Check if user is logged in
    const session = await auth();
    if (!session) {
      redirect('/ui/login'); // Redirect to login page if user is not logged in
    }
    return <p>Customer Page</p>;
}