import Link from 'next/link';
import Button from './components/button'
import Header from './components/header';

const Home = () => {
  const scheduleName = "Casamento de [Nome]"; // Exemplo para a variável ${scheduleName}

  return (
    <>
      <Header disableBackBtn={true}/>
      <div className="flex pt-20 h-screen flex-col items-center justify-between p-8 text-white font-sans">
        
        <div className="flex flex-col items-center mt-12">    
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Laços
          </h1>

          <p className="text-center text-lg leading-relaxed max-w-xs opacity-90">
            Entre em <span className="font-semibold">{scheduleName}</span> e registre suas memórias na caixa do tempo.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          
          <div className="flex flex-col gap-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button background='#4f46e5'>Registrar</Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 pt-6">
            <div className="text-4xl font-black">
              ?
            </div>
            <p className="text-sm">
              Ficou com dúvida! <a href="#" className="text-blue-500 hover:underline">Clique Aqui</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;