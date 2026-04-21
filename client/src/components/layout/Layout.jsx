import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({ children }) {
	return (
		<div className="flex h-screen bg-gray-50 overflow-hidden">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden min-w-0">
				<Header />
				<main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
