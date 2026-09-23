import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, FolderKanban, Image as ImageIcon } from 'lucide-react';
import { API_URL, projectsAPI } from '../utils/api';

const PublicProject = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsAPI.getPublic(slug).then(setData).catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return <div className="min-h-screen p-8 bg-slate-50 text-red-600">{error}</div>;
  }

  if (!data) {
    return <div className="min-h-screen p-8 bg-slate-50">Loading public project...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto p-6 lg:p-10 space-y-6">
        <section className="bg-white border border-gray-100 rounded-xl shadow-elevation-1 p-6">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.project.name}</h1>
              <p className="text-gray-600">{data.project.description}</p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-elevation-1 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Public Notes</h2>
            <div className="space-y-4">
              {data.notes.map((note) => (
                <article key={note._id} className="border border-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 mt-2 font-sans">{note.content}</pre>
                </article>
              ))}
              {data.notes.length === 0 && <p className="text-sm text-gray-500">No public notes yet.</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-elevation-1 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shared Files</h2>
            <div className="space-y-3">
              {data.files.map((file) => (
                <a key={file._id} href={`${API_URL.replace('/api', '')}${file.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                  {file.mimeType.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-primary" />}
                  <span className="text-sm font-medium text-gray-800">{file.originalName}</span>
                </a>
              ))}
              {data.files.length === 0 && <p className="text-sm text-gray-500">No shared files yet.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicProject;
