"use client";
import Link from "next/link";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import getCookie from "@/actions/getCookie";
import { useRouter } from "next/navigation";
import useData from "@/context/DataContext";
import { UserDataType } from "@/context/DataContextProps";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { currentUser, setCurrentUser, setUsers, users, setRollno } = useData();

  useEffect(() => {
    if (currentUser) {
      router.replace("/");
    }
  }, [currentUser]);

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const user = e.currentTarget.user.value;
    const password = e.currentTarget.password.value;
    if (!user || !password) {
      return;
    }
    setLoading(true);

    getCookie(user, password)
      .then((res) => {
        console.log(res);
        const cookieData = res as {
          cookie: string;
          expire: string;
          role: string;
        };

        if (res) {
          setError(false);
          console.log(res);
          router.replace("/");

          const newUser = {
            ...cookieData,
            user,
            password,
          };
          setUsers((prvUsers) => [...prvUsers, newUser]);
          setCurrentUser(newUser);
          setRollno(newUser.user);
        } else {
          setError(true);
        }
      })
      .catch((e) => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="login-page">
      <div className="box">
        <p className="login-heading">DIET ECAP</p>
        <form onSubmit={handleFormSubmit}>
          <div className="inputs">
            <input
              type="text"
              name="user"
              placeholder="Employee or Student ID"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button>
            {!loading ? "Sign In" : <span className="loader"></span>}
          </button>
          {error && <p className="error">Incorrect Password or Id</p>}
        </form>
      </div>
    </div>
  );
}

function FormatDate() {}
