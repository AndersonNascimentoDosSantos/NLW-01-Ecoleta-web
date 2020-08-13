import React,{useEffect, useState,ChangeEvent, FormEvent} from 'react';
import './styles.css';
import {Link,useHistory} from 'react-router-dom'
import logo from '../../assets/logo.svg';
import {FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';

interface  item {
   id:number,
   title:string,
   image_url:string 
};

interface IBGEUFResponse{
    sigla:string
}
interface IBGECITYResponse{
    nome:string
}
const CreatePoint = () => {

    const [items, setItems] = useState<item[]>([]);
    useEffect(()=>{
        api.get('itens').then(
            response => {
                setItems(response.data);
            }
        )

    },[]);

    const [Uf, setUf] = useState<string[]>([]);
    const [selectedUF, setselectedUF] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [initialposition, setinitialposition] = useState<[number,number]>([0,0])
    const [selectedCity, setselectedCity] = useState('0');
    const [latlng, setlatlng] = useState<[number,number]>([0,0]);
   const [formdata, setformdata] = useState({
       name:'',
       email:'',
       whatsapp:''
   });
   const [selectedItems, setselectedItems] = useState<number[]>([])
    function handleSelectedUf(event:ChangeEvent<HTMLSelectElement>){
        setselectedUF(event.target.value);
    }
    function handleSelectedCity(cidade:ChangeEvent<HTMLSelectElement>){
        setselectedCity(cidade.target.value);
    }
    function handleMapClick(map:LeafletMouseEvent){
     setlatlng([map.latlng.lat,map.latlng.lng]);
    }
    function handleInputchange(input:ChangeEvent<HTMLInputElement>){
        const {name,value} = input.target;
        setformdata({...formdata,[name]:value})
    }
    function handeleSelectedItem(id:number){
        const alreadySelected = selectedItems.findIndex(item => item === id );

        if(alreadySelected>=0)
        {
            const filtredItems = selectedItems.filter( item => item !== id);
            setselectedItems(filtredItems);
        }else{
            setselectedItems([...selectedItems,id]);
        }
       
    }
    async function handleSubmit(form:FormEvent){
        form.preventDefault();
        const {email,name,whatsapp} = formdata;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude,longitude] = latlng;
        const items = selectedItems;

        const data = {
            name,
            whatsapp,
            email,
            uf,
            city,
            latitude,
            longitude,
            items
        };
       await api.post('points',data);
       alert("ponto de coleta criado");
        history.push('/');
    }

    const history = useHistory();



    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
        const ufInitials=response.data.map(uf=> uf.sigla)
        
        setUf(ufInitials);

    });
    },[]);

    useEffect(() => {
        axios
        .get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => {
        if(selectedUF === '0'){
            return;
        }
        const cityNames=response.data.map(city=> city.nome)
        
        setCities(cityNames);

    });
            }, [selectedUF]);
    useEffect(()=>{
                navigator.geolocation.getCurrentPosition(position=>{
                   // const {latitude,longitude} = position.coords;
                    
                    setinitialposition([position.coords.latitude,position.coords.longitude]);
                    
                });
            },[])

    return (
       <div id="page-create-point">
           <header>
           <img src={logo} alt="Ecoleta"/>
               <Link to="/">
              <FiArrowLeft/>
               voltar para home
               </Link>
              </header>
              <form onSubmit={handleSubmit}>
                 <h1>Cadastro do <br/> Ponto de Coleta</h1> 
              
              <fieldset>
                <legend><h2>Dados</h2></legend>
                <div className="field">
                    <label htmlFor="name">nome da entidade</label>
                    <input type="text"
                    name="name"
                    id="name"
                
                    onChange={handleInputchange}

                    />
                </div>
                <div className="field-group">
                <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input type="email"
                    name="email"
                    id="email"
                    onChange={handleInputchange}
                    />
                </div>
                <div className="field">
                    <label htmlFor="whatsapp">whatsapp</label>
                    <input type="text"
                    name="whatsapp"
                    id="whatsapp"
                    onChange={handleInputchange}
                    />
                </div>
                </div>
              </fieldset>
              <fieldset>
                  <legend>
                    <h2>Endereços</h2>
                  <span>selecione o endereço no mapa</span>
                  
                  </legend>
                  <Map center={initialposition} 
                  zoom={15}
                  onclick={handleMapClick}
                  >
                  <TileLayer
                 attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
                    <Marker position={latlng}/>
                  </Map>

                  <div className="field-group">
                      <div className="field">
                          <label htmlFor="uf">Estado(UF)</label>
                          <select onChange={handleSelectedUf} 
                          name="uf" 
                          id="uf" 
                          value={selectedUF}>
                              <option value="0">selecione uma UF</option>
                              {Uf.map(uf =>(
                                <option key={uf}
                                 value={uf}>
                                     {uf}
                                </option>  
                              ))}
                          </select>

                      </div>
                      <div className="field">
                          <label htmlFor="city">cidade</label>
                          <select name="city" 
                          id="city"
                          onChange={handleSelectedCity}
                          value={selectedCity}
                          >
                              <option value="0">selecione uma cidade</option>
                              {cities.map(city =>(
                                <option key={city}
                                 value={city}>
                                     {city}
                                </option>  
                              ))}
                          </select>

                      </div>
                  </div>
              </fieldset>
              <fieldset>
                  <legend><h2>Itens de Coleta</h2>
                  <span>Selecione um item ou mais itens abaixo</span>

                  </legend>
                   
                    
                  <ul className="items-grid">
                            {items.map(item => (
                           <li key={item.id} 
                           onClick={()=>handeleSelectedItem(item.id)}
                           className={selectedItems.includes(item.id)? 'selected':''}
                           > <img src={item.image_url} alt={item.title } />
                           <span>{item.title}</span>
                           </li>
                            

                     ))}
                     </ul>

              </fieldset>

              <button type="submit">
                  cadastrar ponto de coleta
              </button>
              </form>
       </div>
    );
}

export default CreatePoint;