import Ellipsonic from '@/components/svgs/ellipsonic.png'
import Image from 'next/image'

export default function LogoCloud() {
    return (
        <section>
            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="flex flex-wrap items-center gap-4">
                    <p className="text-muted-foreground text-center">Trusted by teams at :</p>
                    <div className="**:fill-foreground flex items-center justify-center gap-8">
                        <Image src={Ellipsonic} alt="Ellipsonic" />
                    </div>
                </div>
            </div>
        </section>
    )
}
