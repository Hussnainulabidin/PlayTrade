import { useState, useEffect } from "react"
import ClientSidebar from "../ClientSideBar/ClientSideBar"

const ClientDashboardLayout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#1a172b] w-full">
            <ClientSidebar />
            <div className={`flex-1 ${isMobile ? 'ml-0 pt-16' : 'ml-64'} w-full`}>
                <main className="h-full w-full text-white">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default ClientDashboardLayout 