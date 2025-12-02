"use client";

export default function RoleAssignmentPage() {
  // Fake data for now
  const pendingUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", date: "New" },
    { id: 2, name: "Billy Smith", email: "billy@example.com" },
  ];

  const assignedUsers = [
    { id: 10, name: "Jim Smith", role: "Mechanic" },
    { id: 11, name: "Sarah Thompson", role: "Machine Operator" },
    { id: 12, name: "Kevin Miles", role: "Supervisor" },
    { id: 13, name: "Anna Taylor", role: "Admin" },
    { id: 14, name: "Steven Universe", role: "Mechanic" },
    { id: 15, name: "Mia Johnson", role: "Mechanic" },
    { id: 16, name: "Tom Allen", role: "Inspector" },
    { id: 17, name: "Zoe Carter", role: "Supervisor" },
    { id: 18, name: "Emily Fox", role: "Operator" },
    { id: 19, name: "Michael Brown", role: "Mechanic" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-semibold mb-10 text-gray-900">
        Role Assignment
      </h1>

      {/* ===== Pending Users Section ===== */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Users waiting for role assignment
        </h2>

        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-sm border rounded-lg p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-900 font-medium">{user.name}</p>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              <div className="flex items-center space-x-3">

                {user.date === "New" && (
                  <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                    New
                  </span>
                )}

                <button
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow transition"
                >
                  Assign Role
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Assigned Users Section ===== */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Users with assigned roles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-sm border rounded-lg p-5"
            >
              <p className="text-gray-900 font-medium">{user.name}</p>
              <p className="text-orange-600 font-semibold text-sm">
                Role: {user.role}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
