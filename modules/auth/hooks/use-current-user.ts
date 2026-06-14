import {useSession} from "next-auth/react";

export const useCurrentUser = () =>{  //give current logged in user details on client side
    const session = useSession()
    return session?.data?.user
}