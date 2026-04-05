import { getMyTemplate } from '@/actions/template';
import TemplateEditorClient from '@/components/template/TemplateEditorClient';

export default async function TemplatePage() {
  const template = await getMyTemplate();

  return (
    <div className="bg-[#F2F2F0]">
      <TemplateEditorClient initialData={template} />
    </div>
  );
}
