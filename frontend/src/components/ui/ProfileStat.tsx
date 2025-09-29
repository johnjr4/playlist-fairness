interface ProfileStatProps {
    children: React.ReactNode;
    category: string;
    tip?: string;
}

function ProfileStat({ children, category, tip }: ProfileStatProps) {
    return (
        <div className="flex flex-col items-end justify-center">
            <div className="w-full flex justify-between items-center">
                <div className="text-background-50 font-semibold text-xs sm:text-sm xl:text-base
                w-22 sm:w-26 md:w-30 lg:w-32">
                    {category}:
                </div>
                <div className="grow shrink text-sm sm:text-base lg:text-xl xl:text-2xl text-right font-bold line-clamp-1 truncate
                max-w-[200px] sm:max-w-[350px] lg:max-w-[450px] xl:max-w-[550px]
                sm:min-w-[200px] lg:min-w-[300px]">
                    {children}
                </div>
            </div>
            <div className="text-sm lg:text-base tracking-tight text-background-50">
                {tip}
            </div>
        </div>
    )
}

export default ProfileStat;