"use client";

import { useEffect, useState } from "react";
import styles from "./DepartmentSelector.module.css";

type Department = {
  _id: string;
  name: string;
};

export default function DepartmentSelector({
  userEmail,
  selectedDepartmentId,
}: {
  userEmail: string;
  selectedDepartmentId?: string | null;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments);
    if (selectedDepartmentId) {
      setSelected(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  const handleSelect = async (id: string) => {
    setSelected(id);
    await fetch("/api/user/update-department", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, departmentId: id }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <div className={styles.grid}>
      {departments.map((d) => (
        <button
          key={d._id}
          onClick={() => handleSelect(d._id)}
          className={`${styles.button} ${
            selected === d._id ? styles.buttonSelected : ""
          }`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}
