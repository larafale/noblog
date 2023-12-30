
"use client"
import { Dispatch, createContext, useContext, useState } from "react";

type User = any

const UserContext = createContext({})

type Props = {
    children?: React.ReactNode,
    user: User
}
export const UserProvider = ({ children, user: serverUser }: Props) => {
    const [user, setUser] = useState(serverUser);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
};

type HookProps = {
    user: User,
    setUser: Dispatch<User>
}
export const useUser = () => useContext(UserContext) as HookProps;
