import "./page.css";
import {FeaturePage} from "@/components/FeaturePage";
import {AuthGate} from "@/components/AuthGate";export default function UserProfilePage(){return <AuthGate><FeaturePage title="My Profile" description="View and manage your account details." items={["Personal Information","Phone Number","Account Status","Language Preferences"]}/>}</AuthGate>
