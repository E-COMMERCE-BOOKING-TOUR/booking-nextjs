import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";



type AppSelectProps = {
    valueSelect: string;
    placeholder: string;
    className?: string;
    onChange: (value: string) => void;
    data: string[];
    txtColor?: string;
}

export const AppSelect = (props: AppSelectProps) => {
    return (
        <Select onValueChange={(value) => props.onChange(value)} defaultValue={props.valueSelect}> 
            <SelectTrigger className={`${props.className} text-sm font-bold text-${props.txtColor ?? 'black'}`}>
                <SelectValue placeholder={props.placeholder}/>
            </SelectTrigger>
            <SelectContent>
                {
                    props.data.map((item, index) => {
                        return (
                            <SelectItem
                                key={item}
                                value={props.data[index]}
                                className={`font-bold`}
                            >
                                {props.data[index]}
                            </SelectItem>
                        )
                    })
                }
            </SelectContent>
        </Select>
    )
}