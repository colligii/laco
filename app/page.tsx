import Link from 'next/link';
import Button from './components/button';
import Header from './components/header';
import Loading from './components/loading';

const Home = () => {
  const scheduleName = "Casamento de [Nome]"; // Exemplo para a variável ${scheduleName}

  return (
    <div className="h-screen flex flex-col items-center bg-black text-white">
      <Loading />
      <Header disableBackBtn={true} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold tracking-tight">Laços</h1>
          <p className="text-center text-lg leading-relaxed max-w-xs opacity-90 text-gray-400 mt-2">
            Entre em <span className="font-semibold text-white">{scheduleName}</span> e registre suas memórias na caixa do tempo.
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="flex flex-col gap-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button background="#4f46e5">Registrar</Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 pt-6">
            <div className="text-4xl font-black">?</div>
            <p className="text-sm text-gray-400">
              Ficou com dúvida? <a href="#" className="text-blue-400 hover:underline">Clique aqui</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="pb-10">
        <div className="flex items-center gap-2 opacity-70">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <span className="text-xs uppercase tracking-widest">Bem-vindo</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;