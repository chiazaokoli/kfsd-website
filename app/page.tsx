import Image from "next/image";
import RegistrationForm from "../src/components/RegistrationForm";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  return (
    <main className="form-only-page">
      <div className="form-only-container">
        <header className="form-only-brand">
          <Image src={`${assetPrefix}/images/kfsd-icon.png`} width={38} height={38} alt="KFSD" priority />
          <span>KFSD Soft Skills Training</span>
        </header>
        <RegistrationForm />
      </div>
    </main>
  );
}
