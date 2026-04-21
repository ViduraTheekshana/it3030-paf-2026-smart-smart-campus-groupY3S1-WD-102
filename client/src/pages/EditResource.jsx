import { useEffect, useState } from "react";
import ResourceForm from "../components/ResourceForm";
import { getById, update } from "../api/ResourceAPI"; 
import { useParams } from "react-router-dom";

export default function EditResource() {
  const { id } = useParams();
  const [data, setData] = useState({});

  useEffect(() => {
    getById(id).then(res => setData(res.data));
  }, [id]);

  const submit = (form) => {
    update(id, form).then(() => window.location.href = "/admin");
  };

  return <ResourceForm onSubmit={submit} initialData={data} />;
}