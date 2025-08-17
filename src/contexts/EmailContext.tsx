import axios from 'axios';
import React , { createContext, useContext, useMemo } from 'react';

interface EmailContextType{ 
    updateEmailStatus : (email: string, eventId: string) => void;
}
const server = "http://localhost:3000";
const EmailContext = createContext<EmailContextType | null>(null);
const EmailProvider:React.FC<{ children: React.ReactNode }> = ({ children }) => {
const updateEmailStatus = async (email:string,eventId:string)=>{
        try{
            const res = await axios.put(`${server}/api/emails/status`,{
                email,
                eventId
            })
            if(res.status === 200){
                console.log("Email status updated successfully");
            }
        } catch (error) {
            console.error("Error updating email status:", error);
        }
    }
const refreshEmails = async () => {
    try {
        const res = await axios.get(`${server}/api/emails`);
        if (res.status === 200) {
            console.log("Emails refreshed successfully");
        }
    } catch (error) {
        console.error("Error refreshing emails:", error);
    }
};
 const value = useMemo(
    () => ({
      updateEmailStatus,
      refreshEmails,
    }),
    [] 
  );

    return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const useEmail = (): EmailContextType => {
  const context = useContext(EmailContext);
  if (!context) throw new Error('useEmail must be used within an EmailProvider');
  return context;
};
export default EmailProvider;