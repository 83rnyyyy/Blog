import ProfilePage from "@/components/profile/ProfilePage";

const UserProfile = async ({ params }) => {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    return <ProfilePage userEmail={decodedEmail} />;
};

export default UserProfile;