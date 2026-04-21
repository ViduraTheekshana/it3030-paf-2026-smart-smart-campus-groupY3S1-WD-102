import ResourceForm from "../components/ResourceForm";
import { create } from "../api/ResourceAPI";

export default function AddResource() {
  const submit = (data) => create(data).then(()=>window.location.href="/admin");
  return <ResourceForm onSubmit={submit} />;
}